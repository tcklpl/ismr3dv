import { IMouseListener } from "../../visualizer/io/i_mouse_listener";
import { Visualizer } from "../../visualizer/visualizer";
import { Mat4 } from "../data_formats/mat/mat4";
import { Scene } from "../scenes/scene";
import { BufferUtils } from "../utils/buffer_utils";
import { MUtils } from "../utils/math_utils";
import { TextureUtils } from "../utils/texture_utils";
import { IRenderLayers } from "./i_render_layers";
import { IRenderSettings } from "./i_render_settings";
import { RenderBloomProvider } from "./bloom/render_bloom_provider";
import { RenderComposer } from "./compositor/render_compositor";
import { RenderPickProvider } from "./render_pick_provider";
import { SkyboxRenderableObject } from "../../visualizer/objects/skybox";

export class Renderer implements IMouseListener {

    private _gl = Visualizer.instance.gl;

    private _cameraManager = Visualizer.instance.cameraManager;
    private _sceneManager = Visualizer.instance.sceneManager;

    private _config = Visualizer.instance.configurationManager.graphical;

    private _perspectiveProjectionMatrix!: Mat4;

    private _renderSettings = <IRenderSettings> {
        near: 0.1,
        far: 100,
        width: 1920,
        height: 1080,
        fovY: 60
    };

    private _quadVAO!: WebGLVertexArrayObject;
    private _skyboxVAO!: WebGLVertexArrayObject;

    private _picking = new RenderPickProvider();
    private _bloom = new RenderBloomProvider();
    private _compositor = new RenderComposer();

    private _rlRenderbuffer!: WebGLRenderbuffer;
    private _rlFramebuffer!: WebGLFramebuffer;
    private _layers!: IRenderLayers;

    constructor() {
        this.setupGl();
        this.constructPerspectiveProjectionMatrix();
        Visualizer.instance.io.mouse.registerListener(this);
    }

    private setupGl() {
        this._gl.clearColor(0, 0, 0, 1);

        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.enable(this._gl.CULL_FACE);
        this._gl.depthFunc(this._gl.LEQUAL);

        this._quadVAO = BufferUtils.createQuadVAO(this._gl);
        this._skyboxVAO = BufferUtils.createSkyboxVAO(this._gl);

        this._picking.setup(this._renderSettings);
        this._bloom.setup(this._renderSettings);
        this._compositor.setup(this._renderSettings);
        this.resize(this._gl.canvas.clientWidth, this._gl.canvas.clientHeight);
    }

    private constructPerspectiveProjectionMatrix() {
        this._perspectiveProjectionMatrix = Mat4.perspective(
            MUtils.degToRad(this._renderSettings.fovY), 
            this._renderSettings.width / this._renderSettings.height, 
            this._renderSettings.near, 
            this._renderSettings.far
        );
    }

    resize(width: number, height: number) {
        this._renderSettings.width = Math.floor(width * this._config.resolution_scale);
        this._renderSettings.height = Math.floor(height * this._config.resolution_scale);
        this.constructPerspectiveProjectionMatrix();

        this.setupLayerBuffers();
        this._bloom.updateForResolution(this._renderSettings.width, this._renderSettings.height);
        this._compositor.updateForResolution(width, height);
    }

    private deleteLayerBuffers() {
        this._gl.deleteFramebuffer(this._rlFramebuffer);
        this._gl.deleteRenderbuffer(this._rlRenderbuffer);
        this._gl.deleteTexture(this._layers.raw_color);
        this._gl.deleteTexture(this._layers.raw_bloom);
    }

    private setupLayerBuffers() {
        if (this._layers) this.deleteLayerBuffers();

        this._rlFramebuffer = BufferUtils.createFramebuffer(this._gl);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._rlFramebuffer);

        const colorBuffer = TextureUtils.createHDRBufferTexture(this._gl, this._renderSettings.width, this._renderSettings.height);
        const bloomBuffer = TextureUtils.createHDRBufferTexture(this._gl, this._renderSettings.width, this._renderSettings.height);

        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, colorBuffer, 0);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT1, this._gl.TEXTURE_2D, bloomBuffer, 0);

        // renderbuffer used for depth testing
        this._rlRenderbuffer = BufferUtils.createRenderbuffer(this._gl);
        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, this._rlRenderbuffer);
        this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_COMPONENT32F, this._renderSettings.width, this._renderSettings.height);
        this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, this._rlRenderbuffer);

        this._gl.drawBuffers([ this._gl.COLOR_ATTACHMENT0, this._gl.COLOR_ATTACHMENT1 ]);

        BufferUtils.assertFrameBufferCompletion(this._gl, 'Failed to create render layer buffers');
        this._layers = {
            raw_color: colorBuffer,
            raw_bloom: bloomBuffer
        };

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    onMouseMove(x: number, y: number) {
        this._picking.updatePickingProjectionMatrix(x, y, this._renderSettings.fovY, this._renderSettings.near, this._renderSettings.far);
    }

    renderActive() {
        if (!this._sceneManager.active) {
            console.warn(`Trying to render with no active scene`);
            return;
        }

        const pickingId = this._picking.renderAndPickIdUnderMouse(this._sceneManager.active.opaqueObjects);
        Visualizer.instance.interactionManager.updateIdUnderMouse(pickingId);

        this._gl.viewport(0, 0, this._renderSettings.width, this._renderSettings.height);
        this.renderSceneIntoLayerbuffers();
        if (this._config.bloom) this._bloom.render(this._layers);
        this._compositor.compose(this._layers);
    }

    private renderSceneIntoLayerbuffers() {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._rlFramebuffer);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        const scene = this._sceneManager.active as Scene;

        // first render all opaque objects
        scene.opaqueObjects.forEach(o => {
            o.render(() => {
                this._cameraManager.activeCamera?.matrix.bindUniform(this._gl, o.u_view);
                this._perspectiveProjectionMatrix.bindUniform(this._gl, o.u_projection);
            });
        });

        // then render all gizmos
        Visualizer.instance.gizmoManager.allGizmos.filter(x => x.enabled).forEach(g => {
            g.draw(() => {
                this._cameraManager.activeCamera?.matrix.bindUniform(this._gl, g.u_view);
                this._perspectiveProjectionMatrix.bindUniform(this._gl, g.u_projection);
            });
        });

        // then render transparent objects
        // this is a really simple implementation but it's ok for it's purpose
        this._gl.enable(this._gl.BLEND);
        this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);

        this._gl.depthMask(false);
        scene.transparentObjects.forEach(o => {
            o.render(() => {
                this._cameraManager.activeCamera?.matrix.bindUniform(this._gl, o.u_view);
                this._perspectiveProjectionMatrix.bindUniform(this._gl, o.u_projection);
            });
        });
        this._gl.depthMask(true);
        this._gl.disable(this._gl.BLEND);

        // now render the skybox
        scene.skybox?.render(() => {
            const skybox = scene.skybox as SkyboxRenderableObject;
            this._cameraManager.activeCamera?.matrixNoTranslation.bindUniform(this._gl, skybox.u_view);
            this._perspectiveProjectionMatrix.bindUniform(this._gl, skybox.u_projection);
        });

        // free the framebuffer
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    renderQuad() {
        this._gl.bindVertexArray(this._quadVAO);
        this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
        this._gl.bindVertexArray(null);
    }

    renderSkybox() {
        this._gl.bindVertexArray(this._skyboxVAO);
        this._gl.drawArrays(this._gl.TRIANGLES, 0, 36);
        this._gl.bindVertexArray(null);
    }

    get perspectiveProjectionMat4() {
        return this._perspectiveProjectionMatrix;
    }

    get compositor() {
        return this._compositor;
    }

}