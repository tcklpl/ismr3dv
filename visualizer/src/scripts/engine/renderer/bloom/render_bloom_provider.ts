import { Visualizer } from "../../../visualizer/visualizer";
import { Vec2 } from "../../data_formats/vec/vec2";
import { Shader } from "../../shaders/shader";
import { IRenderPostProcessingProvider } from "../i_prender_post_processing_provider";
import { IRenderLayers } from "../i_render_layers";
import { IRenderSettings } from "../i_render_settings";
import { BloomFBO } from "./bloom_fbo";

export class RenderBloomProvider implements IRenderPostProcessingProvider {

    private _gl = Visualizer.instance.gl;
    private _shaderManager = Visualizer.instance.shaderManager;

    private _resolution!: Vec2;
    private _bloomMips = 5;
    private _filterRadius = 0.004;
    private _bloomFBO!: BloomFBO;

    private _downsampleShader!: Shader;
    private _downsampleUniformTexture!: WebGLUniformLocation;
    private _downsampleUniformResolution!: WebGLUniformLocation;

    private _upsampleShader!: Shader;
    private _upsampleUniformTexture!: WebGLUniformLocation;
    private _upsampleUniformRadius!: WebGLUniformLocation;

    setup(settings: IRenderSettings): void {
        this._resolution = new Vec2(settings.width, settings.height);
        
        this._downsampleShader = this._shaderManager.assertGetShader('bloom-downsample');
        this._downsampleShader.bind();
        this._downsampleUniformTexture = this._downsampleShader.assertGetUniform('u_src_texture');
        this._downsampleUniformResolution = this._downsampleShader.assertGetUniform('u_src_resolution');
        this._gl.uniform1i(this._downsampleUniformTexture, 0);

        this._upsampleShader = this._shaderManager.assertGetShader('bloom-upsample');
        this._upsampleShader.bind();
        this._upsampleUniformTexture = this._upsampleShader.assertGetUniform('u_src_texture');
        this._upsampleUniformRadius = this._upsampleShader.assertGetUniform('u_radius');
        this._gl.uniform1i(this._upsampleUniformTexture, 0);

        this._bloomFBO = new BloomFBO(this._resolution.x, this._resolution.y, this._bloomMips);
    }

    updateForResolution(width: number, height: number): void {
        this._bloomFBO.resize(width, height, this._bloomMips);
    }

    render(layers: IRenderLayers): void {

        this._bloomFBO.bind();

        this.renderDownsamples(layers.raw_bloom);
        this.renderUpsamples(this._filterRadius);

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);

        layers.pfx_bloom = this._bloomFBO.mipChain[0].texture;
    }

    private renderDownsamples(srcTexture: WebGLTexture) {
        const mipChain = this._bloomFBO.mipChain;

        this._downsampleShader.bind();
        this._resolution.bindUniform(this._gl, this._downsampleUniformResolution);

        this._gl.activeTexture(this._gl.TEXTURE0);
        this._gl.bindTexture(this._gl.TEXTURE_2D, srcTexture);

        // Progressively downsample through the mip chain
        for (let i = 0; i < mipChain.length; i++) {
            const mip = mipChain[i];

            this._gl.viewport(0, 0, mip.size.x, mip.size.y);
            this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, mip.texture, 0);

            Visualizer.instance.engine.renderer.renderQuad();

            // Set current resolution as srcResolution for the next iteration
            mip.size.bindUniform(this._gl, this._downsampleUniformResolution);
            // And bind the current mip as the next source
            this._gl.bindTexture(this._gl.TEXTURE_2D, mip.texture);
        }
    }

    private renderUpsamples(filterRadius: number) {
        const mipChain = this._bloomFBO.mipChain;

        this._upsampleShader.bind();
        this._gl.uniform1f(this._upsampleUniformRadius, filterRadius);

        // enable additive blending
        this._gl.enable(this._gl.BLEND);
        this._gl.blendFunc(this._gl.ONE, this._gl.ONE);
        this._gl.blendEquation(this._gl.FUNC_ADD);

        for (let i = mipChain.length - 1; i > 0; i--) {
            const mip = mipChain[i];
            const nextMip = mipChain[i - 1];

            this._gl.activeTexture(this._gl.TEXTURE0);
            this._gl.bindTexture(this._gl.TEXTURE_2D, mip.texture);

            this._gl.viewport(0, 0, nextMip.size.x, nextMip.size.y);
            this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, nextMip.texture, 0);

            Visualizer.instance.engine.renderer.renderQuad();
        }

        this._gl.disable(this._gl.BLEND);
    }

}