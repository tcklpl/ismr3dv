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
        gl.clearColor(0, 0, 0, 1);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.depthFunc(gl.LEQUAL);

        this._quadVAO = BufferUtils.createQuadVAO(gl);
        this._skyboxVAO = BufferUtils.createSkyboxVAO(gl);

        this._picking.setup(this._renderSettings);
        this._bloom.setup(this._renderSettings);
        this._compositor.setup(this._renderSettings);
        this.resize(gl.canvas.clientWidth, gl.canvas.clientHeight);
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
        gl.deleteFramebuffer(this._rlFramebuffer);
        gl.deleteRenderbuffer(this._rlRenderbuffer);
        gl.deleteTexture(this._layers.raw_color);
        gl.deleteTexture(this._layers.raw_bloom);
    }

    private setupLayerBuffers() {
        if (this._layers) this.deleteLayerBuffers();

        this._rlFramebuffer = BufferUtils.createFramebuffer(gl);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._rlFramebuffer);

        const colorBuffer = TextureUtils.createHDRBufferTexture(gl, this._renderSettings.width, this._renderSettings.height);
        const bloomBuffer = TextureUtils.createHDRBufferTexture(gl, this._renderSettings.width, this._renderSettings.height);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorBuffer, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, bloomBuffer, 0);

        // renderbuffer used for depth testing
        this._rlRenderbuffer = BufferUtils.createRenderbuffer(gl);
        gl.bindRenderbuffer(gl.RENDERBUFFER, this._rlRenderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT32F, this._renderSettings.width, this._renderSettings.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._rlRenderbuffer);

        gl.drawBuffers([ gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1 ]);

        BufferUtils.assertFrameBufferCompletion(gl, 'Failed to create render layer buffers');
        this._layers = {
            raw_color: colorBuffer,
            raw_bloom: bloomBuffer
        };

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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

        gl.viewport(0, 0, this._renderSettings.width, this._renderSettings.height);
        this.renderSceneIntoLayerbuffers();
        if (this._config.bloom) this._bloom.render(this._layers);
        this._compositor.compose(this._layers);
    }

    private renderSceneIntoLayerbuffers() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._rlFramebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const scene = this._sceneManager.active as Scene;

        // first render all opaque objects
        scene.opaqueObjects.forEach(o => {
            o.render(() => {
                this._cameraManager.activeCamera?.matrix.bindUniform(gl, o.u_view);
                this._perspectiveProjectionMatrix.bindUniform(gl, o.u_projection);
            });
        });

        // then render all gizmos
        Visualizer.instance.gizmoManager.allGizmos.filter(x => x.enabled).forEach(g => {
            g.draw(() => {
                this._cameraManager.activeCamera?.matrix.bindUniform(gl, g.u_view);
                this._perspectiveProjectionMatrix.bindUniform(gl, g.u_projection);
            });
        });

        // then render transparent objects
        // this is a really simple implementation but it's ok for it's purpose
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.depthMask(false);
        scene.transparentObjects.forEach(o => {
            o.render(() => {
                this._cameraManager.activeCamera?.matrix.bindUniform(gl, o.u_view);
                this._perspectiveProjectionMatrix.bindUniform(gl, o.u_projection);
            });
        });
        gl.depthMask(true);
        gl.disable(gl.BLEND);

        // now render the skybox
        scene.skybox?.render(() => {
            const skybox = scene.skybox as SkyboxRenderableObject;
            this._cameraManager.activeCamera?.matrixNoTranslation.bindUniform(gl, skybox.u_view);
            this._perspectiveProjectionMatrix.bindUniform(gl, skybox.u_projection);
        });

        // free the framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    renderQuad() {
        gl.bindVertexArray(this._quadVAO);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindVertexArray(null);
    }

    renderSkybox() {
        gl.bindVertexArray(this._skyboxVAO);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        gl.bindVertexArray(null);
    }

    get perspectiveProjectionMat4() {
        return this._perspectiveProjectionMatrix;
    }

    get compositor() {
        return this._compositor;
    }

}