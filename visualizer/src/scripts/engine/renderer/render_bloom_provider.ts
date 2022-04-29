import { Visualizer } from "../../visualizer/visualizer";
import { Vec2 } from "../data_formats/vec/vec2";
import { Shader } from "../shaders/shader";
import { BufferUtils } from "../utils/buffer_utils";
import { MUtils } from "../utils/math_utils";
import { TextureUtils } from "../utils/texture_utils";
import { IRenderPostProcessingProvider } from "./i_prender_post_processing_provider";
import { IRenderLayers } from "./i_render_layers";
import { IRenderSettings } from "./i_render_settings";
import { PingPongFramebuffer } from "./ping_pong_framebuffer";

export class RenderBloomProvider implements IRenderPostProcessingProvider {

    private _gl = Visualizer.instance.gl;
    private _shaderManager = Visualizer.instance.shaderManager;

    private _resolution!: Vec2;
    private _altResolutions: Vec2[] = [];
    private _aspectRatio!: number;

    private _gaussianShader!: Shader;
    private _gaussianUniformImage!: WebGLUniformLocation;
    private _gaussianUniformKernel!: WebGLUniformLocation[];
    private _gaussianUniformKernelSize!: WebGLUniformLocation;
    private _gaussianUniformHorizontal!: WebGLUniformLocation;

    private _bloomResolutionPasses = [2, 3, 4];
    private _bloomBoxBlurIntensity = 1;

    private _bloomCombineShader!: Shader;
    private _bcPass1Uniform!: WebGLUniformLocation;
    private _bcPass2Uniform!: WebGLUniformLocation;
    private _bcPass3Uniform!: WebGLUniformLocation;
    private _bcBoxBlurIntensity!: WebGLUniformLocation;

    private _gp1Buffer!: PingPongFramebuffer;
    private _gp2Buffer!: PingPongFramebuffer;
    private _gp3Buffer!: PingPongFramebuffer;

    private _gpCombineBuffer!: WebGLTexture;
    private _gpCombineFramebuffer!: WebGLFramebuffer;

    private _gKernel5 = MUtils.generateGaussianKernel(5, 10, 0, 0.5);
    private _gKernel7 = MUtils.generateGaussianKernel(7, 14, 0, 0.5);
    private _gKernel10 = MUtils.generateGaussianKernel(50, 100, 0, 0.1);

    setup(settings: IRenderSettings): void {
        this._resolution = new Vec2(settings.width, settings.height);
        this.computeAltResolutions();

        this.setupBloomCombineBuffer(settings.width, settings.height);

        this._gp1Buffer = new PingPongFramebuffer(this._altResolutions[0]);
        this._gp2Buffer = new PingPongFramebuffer(this._altResolutions[1]);
        this._gp3Buffer = new PingPongFramebuffer(this._altResolutions[2]);

        this._gaussianShader = this._shaderManager.getByName('gaussian') as Shader;
        this._gaussianUniformImage = this._gaussianShader.assertGetUniform('u_image');
        this._gaussianUniformKernelSize = this._gaussianShader.assertGetUniform('u_kernel_size');
        this._gaussianUniformHorizontal = this._gaussianShader.assertGetUniform('u_horizontal');
        this._gaussianUniformKernel = [];
        for (let i = 0; i < 10; i++) {
            this._gaussianUniformKernel.push(this._gaussianShader.assertGetUniform(`u_kernel[${i}]`));
        }

        this._bloomCombineShader = this._shaderManager.getByName('bloom_combine') as Shader;
        this._bcPass1Uniform = this._bloomCombineShader.assertGetUniform('u_bloom_pass_1');
        this._bcPass2Uniform = this._bloomCombineShader.assertGetUniform('u_bloom_pass_2');
        this._bcPass3Uniform = this._bloomCombineShader.assertGetUniform('u_bloom_pass_3');
        this._bcBoxBlurIntensity = this._bloomCombineShader.assertGetUniform('u_box_blur_intensity');
    }

    private computeAltResolutions() {
        this._altResolutions = [
            new Vec2(this._resolution.x / this._bloomResolutionPasses[0], this._resolution.y / this._bloomResolutionPasses[0]),
            new Vec2(this._resolution.x / this._bloomResolutionPasses[1], this._resolution.y / this._bloomResolutionPasses[1]),
            new Vec2(this._resolution.x / this._bloomResolutionPasses[2], this._resolution.y / this._bloomResolutionPasses[2])
        ];
        this._aspectRatio = this._resolution.x / this._resolution.y;
    }

    private deleteBloomCombineBuffer() {
        this._gl.deleteFramebuffer(this._gpCombineFramebuffer);
        this._gl.deleteTexture(this._gpCombineBuffer);
    }

    private setupBloomCombineBuffer(width: number, height: number) {
        this.deleteBloomCombineBuffer();

        this._gpCombineFramebuffer = BufferUtils.createFramebuffer(this._gl);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._gpCombineFramebuffer);
        this._gpCombineBuffer = TextureUtils.createBufferTexture(this._gl, width, height);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._gpCombineBuffer, 0);
        BufferUtils.assertFrameBufferCompletion(this._gl, 'Failed to create bloom combined framebuffer');

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    updateForResolution(width: number, height: number): void {
        this._resolution.x = width;
        this._resolution.y = height;
        this.computeAltResolutions();
        this.setupBloomCombineBuffer(width, height);
        this._gp1Buffer.changeResolution(this._altResolutions[0]);
        this._gp2Buffer.changeResolution(this._altResolutions[1]);
        this._gp3Buffer.changeResolution(this._altResolutions[2]);
    }

    nPassGaussianBlur(source: WebGLTexture, pingPongFb: PingPongFramebuffer, kernel: number[], passes: number) {
        this._gaussianShader.bind();
        kernel.forEach((kv, i) => this._gl.uniform1f(this._gaussianUniformKernel[i], kv));
        this._gl.uniform1i(this._gaussianUniformKernelSize, kernel.length);
        this._gl.uniform1i(this._gaussianUniformImage, 0);

        for (let i = 0; i < passes; i++) {
            const even = (i & 1) == 0;
            this._gl.uniform1i(this._gaussianUniformHorizontal, i & 1);
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, even ? pingPongFb.fbPing : pingPongFb.fbPong);
            this._gl.bindTexture(this._gl.TEXTURE_2D, i == 0 ? source : even ? pingPongFb.texPong : pingPongFb.texPing);
            Visualizer.instance.engine.renderer.renderQuad();
        }

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        return (passes & 1) == 1 ? pingPongFb.texPing : pingPongFb.texPong;
    }

    render(layers: IRenderLayers): void {

        // pass 1
        this._gl.viewport(0, 0, this._altResolutions[0].x, this._altResolutions[0].y);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        const pass1 = this.nPassGaussianBlur(layers.raw_bloom, this._gp1Buffer, this._gKernel5, 2);

        // pass 2
        this._gl.viewport(0, 0, this._altResolutions[1].x, this._altResolutions[1].y);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        const pass2 = this.nPassGaussianBlur(layers.raw_bloom, this._gp2Buffer, this._gKernel7, 2);

        // pass 3
        this._gl.viewport(0, 0, this._altResolutions[2].x, this._altResolutions[2].y);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        const pass3 = this.nPassGaussianBlur(layers.raw_bloom, this._gp3Buffer, this._gKernel10, 3);

        // now combine all passes
        this._gl.viewport(0, 0, this._resolution.x, this._resolution.y);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._gpCombineFramebuffer);
        this._bloomCombineShader.bind();
        this._gl.uniform1i(this._bcBoxBlurIntensity, this._bloomBoxBlurIntensity);

        this._gl.uniform1i(this._bcPass1Uniform, 0);
        this._gl.activeTexture(this._gl.TEXTURE0);
        this._gl.bindTexture(this._gl.TEXTURE_2D, pass1);

        this._gl.uniform1i(this._bcPass2Uniform, 1);
        this._gl.activeTexture(this._gl.TEXTURE1);
        this._gl.bindTexture(this._gl.TEXTURE_2D, pass2);

        this._gl.uniform1i(this._bcPass3Uniform, 2);
        this._gl.activeTexture(this._gl.TEXTURE2);
        this._gl.bindTexture(this._gl.TEXTURE_2D, pass3);

        Visualizer.instance.engine.renderer.renderQuad();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        layers.pfx_bloom = this._gpCombineBuffer;
    }

}