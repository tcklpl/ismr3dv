import { Visualizer } from "../../visualizer/visualizer";
import { UBoolean } from "../data_formats/uniformable_basics/u_boolean";
import { UFloat } from "../data_formats/uniformable_basics/u_float";
import { Vec2 } from "../data_formats/vec/vec2";
import { Shader } from "../shaders/shader";
import { BufferUtils } from "../utils/buffer_utils";
import { TextureUtils } from "../utils/texture_utils";
import { IRenderPostProcessingProvider } from "./i_prender_post_processing_provider";
import { IRenderLayers } from "./i_render_layers";
import { IRenderSettings } from "./i_render_settings";
import { Renderer } from "./renderer";

export class RenderBloomProvider implements IRenderPostProcessingProvider {

    private _gl = Visualizer.instance.gl;
    private _shaderManager = Visualizer.instance.shaderManager;

    private _resolution!: Vec2;

    private _pingFramebuffer!: WebGLFramebuffer;
    private _pingBuffer!: WebGLTexture;
    private _pongFramebuffer!: WebGLFramebuffer;
    private _pongBuffer!: WebGLTexture;

    private _gaussianShader!: Shader;
    private _gaussianUniformImage!: WebGLUniformLocation;
    private _gaussianUniformHorizontal!: WebGLUniformLocation;
    private _gaussianUniformAspect!: WebGLUniformLocation;

    setup(settings: IRenderSettings): void {
        this._resolution = new Vec2(settings.width, settings.height);
        
        this.setupPingPongFB(settings.width, settings.height);

        this._gaussianShader = this._shaderManager.getByName('gaussian') as Shader;
        this._gaussianUniformImage = this._gaussianShader.assertGetUniform('u_image');
        this._gaussianUniformHorizontal = this._gaussianShader.assertGetUniform('u_horizontal');
        this._gaussianUniformAspect = this._gaussianShader.assertGetUniform('u_aspect');
    }

    private deletePingPongFB() {
        this._gl.deleteFramebuffer(this._pingFramebuffer);
        this._gl.deleteFramebuffer(this._pongFramebuffer);
        this._gl.deleteTexture(this._pingBuffer);
        this._gl.deleteTexture(this._pongBuffer);
    }

    private setupPingPongFB(width: number, height: number) {
        this.deletePingPongFB();

        this._pingFramebuffer = BufferUtils.createFramebuffer(this._gl);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._pingFramebuffer);
        this._pingBuffer = TextureUtils.createBufferTexture(this._gl, width, height);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._pingBuffer, 0);
        BufferUtils.assertFrameBufferCompletion(this._gl, 'Failed to create bloom ping buffer');

        this._pongFramebuffer = BufferUtils.createFramebuffer(this._gl);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._pongFramebuffer);
        this._pongBuffer = TextureUtils.createBufferTexture(this._gl, width, height);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._pongBuffer, 0);
        BufferUtils.assertFrameBufferCompletion(this._gl, 'Failed to create bloom pong buffer');

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    updateForResolution(width: number, height: number): void {
        this.setupPingPongFB(width, height);
        this._resolution.x = width;
        this._resolution.y = height;
    }

    render(layers: IRenderLayers): void {
        this._gl.viewport(0, 0, this._resolution.x, this._resolution.y);

        let firstIteration = true;
        let horizontal = new UBoolean(true);
        let aspect = new UFloat(this._resolution.x / this._resolution.y);
        let amount = 10;
        this._gaussianShader.bind();
        aspect.bindUniform(this._gl, this._gaussianUniformAspect);

        for (let i = 0; i < amount; i++) {
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, horizontal.value ? this._pongFramebuffer : this._pingFramebuffer);
            horizontal.bindUniform(this._gl, this._gaussianUniformHorizontal);
            this._gl.uniform1i(this._gaussianUniformImage, 0);
            this._gl.bindTexture(this._gl.TEXTURE_2D, firstIteration ? layers.raw_bloom : (horizontal.value ? this._pingBuffer : this._pongBuffer));
            Visualizer.instance.engine.renderer.renderQuad();
            horizontal.value = !horizontal.value;
            if (firstIteration)
                firstIteration = false;
        }
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        layers.pfx_bloom = horizontal.value ? this._pingBuffer : this._pongBuffer;
    }

}