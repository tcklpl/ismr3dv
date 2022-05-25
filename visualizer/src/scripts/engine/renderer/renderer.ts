import { IMouseListener } from "../../visualizer/io/i_mouse_listener";
import { Visualizer } from "../../visualizer/visualizer";
import { Mat4 } from "../data_formats/mat/mat4";
import { Scene } from "../scenes/scene";
import { BufferUtils } from "../utils/buffer_utils";
import { MUtils } from "../utils/math_utils";
import { TextureUtils } from "../utils/texture_utils";
import { IRenderLayers } from "./i_render_layers";
import { IRenderSettings } from "./i_render_settings";
import { RenderBloomProvider } from "./render_bloom_provider";
import { RenderComposer } from "./render_composer";
import { RenderPickProvider } from "./render_pick_provider";

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

    private _picking = new RenderPickProvider();
    private _bloom = new RenderBloomProvider();
    private _composer = new RenderComposer();

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
        this._gl.depthFunc(this._gl.LESS);

        this._quadVAO = BufferUtils.createQuadVAO(this._gl);

        this._picking.setup(this._renderSettings);
        this._bloom.setup(this._renderSettings);
        this._composer.setup(this._renderSettings);
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
        this._renderSettings.width = width;
        this._renderSettings.height = height;
        this.constructPerspectiveProjectionMatrix();

        this.setupLayerBuffers();
        this._bloom.updateForResolution(width, height);
        this._composer.updateForResolution(width, height);
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

        const colorBuffer = TextureUtils.createBufferTexture(this._gl, this._renderSettings.width, this._renderSettings.height);
        const bloomBuffer = TextureUtils.createBufferTexture(this._gl, this._renderSettings.width, this._renderSettings.height);

        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, colorBuffer, 0);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT1, this._gl.TEXTURE_2D, bloomBuffer, 0);

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

        const pickingId = this._picking.renderAndPickIdUnderMouse(this._sceneManager.active.objects);
        Visualizer.instance.interactionManager.updateIdUnderMouse(pickingId);

        this._gl.viewport(0, 0, this._renderSettings.width, this._renderSettings.height);
        this.renderSceneIntoLayerbuffers();
        if (this._config.bloom) this._bloom.render(this._layers);
        this._composer.compose(this._layers);
    }

    private renderSceneIntoLayerbuffers() {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._rlFramebuffer);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        (this._sceneManager.active as Scene).objects.forEach(o => {
            o.render(() => {
                this._cameraManager.activeCamera?.matrix.bindUniform(this._gl, o.u_view);
                this._perspectiveProjectionMatrix.bindUniform(this._gl, o.u_projection);
            });
        });

        Visualizer.instance.gizmoManager.allGizmos.filter(x => x.enabled).forEach(g => {
            g.draw(() => {
                this._cameraManager.activeCamera?.matrix.bindUniform(this._gl, g.u_view);
                this._perspectiveProjectionMatrix.bindUniform(this._gl, g.u_projection);
            });
        })
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    renderQuad() {
        this._gl.bindVertexArray(this._quadVAO);
        this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
        this._gl.bindVertexArray(null);
    }

    get perspectiveProjectionMat4() {
        return this._perspectiveProjectionMatrix;
    }

}