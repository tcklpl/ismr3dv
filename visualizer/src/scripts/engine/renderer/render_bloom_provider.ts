import { Visualizer } from "../../visualizer/visualizer";
import { Vec2 } from "../data_formats/vec/vec2";
import { Shader } from "../shaders/shader";
import { BufferUtils } from "../utils/buffer_utils";
import { MUtils } from "../utils/math_utils";
import { TextureUtils } from "../utils/texture_utils";
import { IRenderPostProcessingProvider } from "./i_prender_post_processing_provider";
import { IRenderLayers } from "./i_render_layers";
import { IRenderSettings } from "./i_render_settings";

export class RenderBloomProvider implements IRenderPostProcessingProvider {

    private _gl = Visualizer.instance.gl;
    private _shaderManager = Visualizer.instance.shaderManager;

    private _resolution!: Vec2;

    private _gaussianShader!: Shader;
    private _gaussianUniformImage!: WebGLUniformLocation;
    private _gaussianUniformKernel!: WebGLUniformLocation[];
    private _gaussianUniformKernelSize!: WebGLUniformLocation;

    private _bloomResolutionPasses = [1, 2, 4];
    private _bloomBoxBlurIntensity = 2;

    private _bloomCombineShader!: Shader;
    private _bcPass1Uniform!: WebGLUniformLocation;
    private _bcPass2Uniform!: WebGLUniformLocation;
    private _bcPass3Uniform!: WebGLUniformLocation;
    private _bcBoxBlurIntensity!: WebGLUniformLocation;

    private _gp1Framebuffer!: WebGLFramebuffer;
    private _gp2Framebuffer!: WebGLFramebuffer;
    private _gp3Framebuffer!: WebGLFramebuffer;

    private _gp1Buffer!: WebGLTexture;
    private _gp2Buffer!: WebGLTexture;
    private _gp3Buffer!: WebGLTexture;

    private _gpCombineBuffer!: WebGLTexture;
    private _gpCombineFramebuffer!: WebGLFramebuffer;

    private _gKernel5 = MUtils.generateGaussianKernel(5, 10, 0, 0.3);
    private _gKernel7 = MUtils.generateGaussianKernel(7, 14, 0, 0.3);
    private _gKernel10 = MUtils.generateGaussianKernel(10, 20, 0, 0.3);

    setup(settings: IRenderSettings): void {
        this._resolution = new Vec2(settings.width, settings.height);
        
        this.setupBloomPassBuffers(settings.width, settings.height);

        this._gaussianShader = this._shaderManager.getByName('gaussian') as Shader;
        this._gaussianUniformImage = this._gaussianShader.assertGetUniform('u_image');
        this._gaussianUniformKernelSize = this._gaussianShader.assertGetUniform('u_kernel_size');
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

    private deleteBloomPassBuffers() {
        this._gl.deleteFramebuffer(this._gp1Framebuffer);
        this._gl.deleteFramebuffer(this._gp2Framebuffer);
        this._gl.deleteFramebuffer(this._gp3Framebuffer);
        this._gl.deleteFramebuffer(this._gpCombineFramebuffer);
        this._gl.deleteTexture(this._gp1Buffer);
        this._gl.deleteTexture(this._gp2Buffer);
        this._gl.deleteTexture(this._gp3Buffer);
        this._gl.deleteTexture(this._gpCombineBuffer);
    }

    private setupBloomPassBuffers(width: number, height: number) {
        this.deleteBloomPassBuffers();

        this._gp1Framebuffer = BufferUtils.createFramebuffer(this._gl);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._gp1Framebuffer);
        this._gp1Buffer = TextureUtils.createBufferTexture(this._gl, width / this._bloomResolutionPasses[0], height / this._bloomResolutionPasses[0]);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._gp1Buffer, 0);
        BufferUtils.assertFrameBufferCompletion(this._gl, 'Failed to create bloom pass #1 framebuffer');

        this._gp2Framebuffer = BufferUtils.createFramebuffer(this._gl);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._gp2Framebuffer);
        this._gp2Buffer = TextureUtils.createBufferTexture(this._gl, width / this._bloomResolutionPasses[1], height / this._bloomResolutionPasses[1]);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._gp2Buffer, 0);
        BufferUtils.assertFrameBufferCompletion(this._gl, 'Failed to create bloom pass #2 framebuffer');

        this._gp3Framebuffer = BufferUtils.createFramebuffer(this._gl);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._gp3Framebuffer);
        this._gp3Buffer = TextureUtils.createBufferTexture(this._gl, width / this._bloomResolutionPasses[2], height / this._bloomResolutionPasses[2]);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._gp3Buffer, 0);
        BufferUtils.assertFrameBufferCompletion(this._gl, 'Failed to create bloom pass #3 framebuffer');

        this._gpCombineFramebuffer = BufferUtils.createFramebuffer(this._gl);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._gpCombineFramebuffer);
        this._gpCombineBuffer = TextureUtils.createBufferTexture(this._gl, width, height);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._gpCombineBuffer, 0);
        BufferUtils.assertFrameBufferCompletion(this._gl, 'Failed to create bloom combined framebuffer');

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    updateForResolution(width: number, height: number): void {
        this.setupBloomPassBuffers(width, height);
        this._resolution.x = width;
        this._resolution.y = height;
    }

    twoPassGaussianBlur(source: WebGLTexture, targetFb: WebGLFramebuffer, kernel: number[]) {
        this._gaussianShader.bind();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, targetFb);
        this._gl.uniform1i(this._gaussianUniformKernelSize, kernel.length);
        kernel.forEach((kv, i) => this._gl.uniform1f(this._gaussianUniformKernel[i], kv));
        this._gl.uniform1i(this._gaussianUniformImage, 0);
        this._gl.bindTexture(this._gl.TEXTURE_2D, source);
        Visualizer.instance.engine.renderer.renderQuad();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    render(layers: IRenderLayers): void {

        // pass 1
        this._gl.viewport(0, 0, this._resolution.x / this._bloomResolutionPasses[0], this._resolution.y / this._bloomResolutionPasses[0]);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        this.twoPassGaussianBlur(layers.raw_bloom, this._gp1Framebuffer, this._gKernel5);

        // pass 2
        this._gl.viewport(0, 0, this._resolution.x / this._bloomResolutionPasses[1], this._resolution.y / this._bloomResolutionPasses[1]);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        this.twoPassGaussianBlur(this._gp1Buffer, this._gp2Framebuffer, this._gKernel7);

        // pass 3
        this._gl.viewport(0, 0, this._resolution.x / this._bloomResolutionPasses[2], this._resolution.y / this._bloomResolutionPasses[2]);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        this.twoPassGaussianBlur(this._gp2Buffer, this._gp3Framebuffer, this._gKernel10);

        // now combine all passes
        this._gl.viewport(0, 0, this._resolution.x, this._resolution.y);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._gpCombineFramebuffer);
        this._bloomCombineShader.bind();
        this._gl.uniform1i(this._bcBoxBlurIntensity, this._bloomBoxBlurIntensity);

        this._gl.uniform1i(this._bcPass1Uniform, 0);
        this._gl.activeTexture(this._gl.TEXTURE0);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._gp1Buffer);

        this._gl.uniform1i(this._bcPass2Uniform, 1);
        this._gl.activeTexture(this._gl.TEXTURE1);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._gp2Buffer);

        this._gl.uniform1i(this._bcPass3Uniform, 2);
        this._gl.activeTexture(this._gl.TEXTURE2);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._gp3Buffer);

        Visualizer.instance.engine.renderer.renderQuad();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        layers.pfx_bloom = this._gpCombineBuffer;
    }

}