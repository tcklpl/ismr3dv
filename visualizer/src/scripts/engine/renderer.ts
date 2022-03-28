import { Visualizer } from "../visualizer/visualizer";
import { Mat4 } from "./data_formats/mat/mat4";
import { UBoolean } from "./data_formats/uniformable_basics/u_boolean";
import { UFloat } from "./data_formats/uniformable_basics/u_float";
import { Scene } from "./scenes/scene";
import { Shader } from "./shaders/shader";
import { BufferUtils } from "./utils/buffer_utils";
import { MUtils } from "./utils/math_utils";
import { TextureUtils } from "./utils/texture_utils";

export class Renderer {

    private _gl = Visualizer.instance.gl;

    private _cameraManager = Visualizer.instance.cameraManager;
    private _sceneManager = Visualizer.instance.sceneManager;
    private _shaderManager = Visualizer.instance.shaderManager;

    private _config = Visualizer.instance.configurationManager.graphical;

    private _perspectiveProjectionMatrix!: Mat4;

    private _near = 0.1;
    private _far = 100;
    private _width = 1920;
    private _height = 1080;
    private _fovY = 45;

    private _quadVAO!: WebGLVertexArrayObject;

    private _pfxRenderbuffer!: WebGLRenderbuffer;

    private _postEffectsFramebuffer!: WebGLFramebuffer;
    private _colorBuffer!: WebGLTexture;
    private _bloomBuffer!: WebGLTexture;

    private _pingFramebuffer!: WebGLFramebuffer;
    private _pingBuffer!: WebGLTexture;
    private _pongFramebuffer!: WebGLFramebuffer;
    private _pongBuffer!: WebGLTexture;

    private _gaussianShader!: Shader;
    private _gaussianUniformImage!: WebGLUniformLocation;
    private _gaussianUniformHorizontal!: WebGLUniformLocation;
    private _gaussianUniformAspect!: WebGLUniformLocation;
    private _gaussianLastHorizontalValue!: boolean;

    private _postProcessCombineShader!: Shader;
    private _ppcsUniformColorBuffer!: WebGLUniformLocation;
    private _ppcsUniformBloomBuffer!: WebGLUniformLocation;
    private _ppcsUniformApplyBloom!: WebGLUniformLocation;

    constructor() {
        this.setupGl();
        this.constructPerspectiveProjectionMatrix();
        this.fetchShaders();
    }

    private setupGl() {
        this._gl.clearColor(0, 0, 0, 1);

        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.enable(this._gl.CULL_FACE);
        this._gl.depthFunc(this._gl.LESS);

        this._quadVAO = BufferUtils.createQuadVAO(this._gl);

        this.resize(this._gl.canvas.clientWidth, this._gl.canvas.clientHeight, true);
    }

    private fetchShaders() {
        this._gaussianShader = this._shaderManager.getByName('gaussian') as Shader;
        this._postProcessCombineShader = this._shaderManager.getByName('post_process_combine') as Shader;

        this._gaussianUniformImage = this._gaussianShader.assertGetUniform('u_image');
        this._gaussianUniformHorizontal = this._gaussianShader.assertGetUniform('u_horizontal');
        this._gaussianUniformAspect = this._gaussianShader.assertGetUniform('u_aspect');

        this._ppcsUniformColorBuffer = this._postProcessCombineShader.assertGetUniform('u_color_buffer');
        this._ppcsUniformBloomBuffer = this._postProcessCombineShader.assertGetUniform('u_bloom_buffer');
        this._ppcsUniformApplyBloom = this._postProcessCombineShader.assertGetUniform('u_bloom');
    }

    private constructPerspectiveProjectionMatrix() {
        this._perspectiveProjectionMatrix = Mat4.perspective(MUtils.degToRad(this._fovY), this._width / this._height, this._near, this._far);
    }

    resize(width: number, height: number, firstRun?: boolean) {
        this._width = width;
        this._height = height;
        this.constructPerspectiveProjectionMatrix();
        this._gl.viewport(0, 0, width, height);

        this.createPostEffectsFramebuffer(firstRun);
        this.createPingPongFramebuffer(firstRun);
    }

    private createPostEffectsFramebuffer(firstRun?: boolean) {
        if (firstRun) {
            this._postEffectsFramebuffer = BufferUtils.createFramebuffer(this._gl);
            this._pfxRenderbuffer = BufferUtils.createRenderbuffer(this._gl);
        } else {
            this._gl.deleteTexture(this._colorBuffer);
            this._gl.deleteTexture(this._bloomBuffer);
        }

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._postEffectsFramebuffer);

        this._colorBuffer = TextureUtils.createBufferTexture(this._gl, this._width, this._height);
        this._bloomBuffer = TextureUtils.createBufferTexture(this._gl, this._width, this._height);

        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._colorBuffer, 0);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT1, this._gl.TEXTURE_2D, this._bloomBuffer, 0);

        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, this._pfxRenderbuffer);
        this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_COMPONENT32F, this._width, this._height);
        this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, this._pfxRenderbuffer);

        this._gl.drawBuffers([ this._gl.COLOR_ATTACHMENT0, this._gl.COLOR_ATTACHMENT1 ]);

        let status = this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER);
        if (status != this._gl.FRAMEBUFFER_COMPLETE) {
            console.warn(`POST EFFECTS Framebuffer not complete, status: ${status} vs ${this._gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT}`);
        }

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    private createPingPongFramebuffer(firstRun?: boolean) {
        if (firstRun) {
            this._pingFramebuffer = BufferUtils.createFramebuffer(this._gl);
            this._pongFramebuffer = BufferUtils.createFramebuffer(this._gl);
        } else {
            this._gl.deleteTexture(this._pingBuffer);
            this._gl.deleteTexture(this._pongBuffer);
        }

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._pingFramebuffer);
        this._pingBuffer = TextureUtils.createBufferTexture(this._gl, this._width, this._height);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._pingBuffer, 0);

        let status = this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER);
        if (status != this._gl.FRAMEBUFFER_COMPLETE) {
            console.warn(`PING Framebuffer not complete, status: ${status}`);
        }
        
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._pongFramebuffer);
        this._pongBuffer = TextureUtils.createBufferTexture(this._gl, this._width, this._height);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._pongBuffer, 0);

        status = this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER);
        if (status != this._gl.FRAMEBUFFER_COMPLETE) {
            console.warn(`PONG Framebuffer not complete, status: ${status}`);
        }

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    renderActive() {
        if (!this._sceneManager.active) {
            console.warn(`Trying to render with no active scene`);
            return;
        }

        this.renderSceneIntoFramebuffers();
        if (this._config.bloom) this.applyBloom();
        this.composeScene();
    }

    private renderSceneIntoFramebuffers() {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._postEffectsFramebuffer);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        (this._sceneManager.active as Scene).objects.forEach(o => {
            o.render(() => {
                this._cameraManager.activeCamera?.matrix.bindUniform(this._gl, o.u_view);
                this._perspectiveProjectionMatrix.bindUniform(this._gl, o.u_projection);
            });
        });
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    private applyBloom() {
        let firstIteration = true;
        let horizontal = new UBoolean(true);
        let aspect = new UFloat(this._width / this._height);
        let amount = 10;
        this._gaussianShader.bind();
        aspect.bindUniform(this._gl, this._gaussianUniformAspect);

        for (let i = 0; i < amount; i++) {
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, horizontal.value ? this._pongFramebuffer : this._pingFramebuffer);
            horizontal.bindUniform(this._gl, this._gaussianUniformHorizontal);
            this._gl.uniform1i(this._gaussianUniformImage, 0);
            this._gl.bindTexture(this._gl.TEXTURE_2D, firstIteration ? this._bloomBuffer : (horizontal.value ? this._pingBuffer : this._pongBuffer));
            this.renderQuad();
            horizontal.value = !horizontal.value;
            if (firstIteration)
                firstIteration = false;
        }
        this._gaussianLastHorizontalValue = horizontal.value;
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    private composeScene() {
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        this._postProcessCombineShader.bind();

        this._gl.uniform1i(this._ppcsUniformColorBuffer, 0);
        this._gl.activeTexture(this._gl.TEXTURE0);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._colorBuffer);

        this._gl.uniform1i(this._ppcsUniformBloomBuffer, 1);
        this._gl.activeTexture(this._gl.TEXTURE1);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._gaussianLastHorizontalValue ? this._pingBuffer : this._pongBuffer);

        new UBoolean(this._config.bloom).bindUniform(this._gl, this._ppcsUniformApplyBloom);
        this.renderQuad();
    }

    private renderQuad() {
        this._gl.bindVertexArray(this._quadVAO);
        this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
        this._gl.bindVertexArray(null);
    }

}