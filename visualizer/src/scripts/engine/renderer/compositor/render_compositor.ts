import { Visualizer } from "../../../visualizer/visualizer";
import { UBoolean } from "../../data_formats/uniformable_basics/u_boolean";
import { Vec2 } from "../../data_formats/vec/vec2";
import { Shader } from "../../shaders/shader";
import { IRenderLayers } from "../i_render_layers";
import { IRenderProvider } from "../i_render_provider";
import { IRenderSettings } from "../i_render_settings";

export class RenderComposer implements IRenderProvider {

    private _gl = Visualizer.instance.gl;
    private _shaderManager = Visualizer.instance.shaderManager;
    private _config = Visualizer.instance.configurationManager;

    private _resolution!: Vec2;

    private _combineShader!: Shader;
    private _uniformColorBuffer!: WebGLUniformLocation;
    private _uniformBloomBuffer!: WebGLUniformLocation;
    private _uniformApplyBloom!: WebGLUniformLocation;

    private _uniformExposure!: WebGLUniformLocation;
    private _uniformGamma!: WebGLUniformLocation;
    private _uniformBloomStrength!: WebGLUniformLocation;

    setup(settings: IRenderSettings): void {
        this._resolution = new Vec2(settings.width, settings.height);

        this._combineShader = this._shaderManager.assertGetShader('post_process_combine');
        this._combineShader.bind();
        this._uniformColorBuffer = this._combineShader.assertGetUniform('u_color_buffer');
        this._uniformBloomBuffer = this._combineShader.assertGetUniform('u_bloom_buffer');
        this._uniformApplyBloom = this._combineShader.assertGetUniform('u_bloom');

        this._uniformExposure = this._combineShader.assertGetUniform('u_exposure');
        this._uniformGamma = this._combineShader.assertGetUniform('u_gamma');
        this._uniformBloomStrength = this._combineShader.assertGetUniform('u_bloom_strength');

        this.updateSettings();
    }

    updateForResolution(width: number, height: number): void {
        this._resolution.x = width;
        this._resolution.y = height;
    }

    updateSettings() {
        this._gl.uniform1f(this._uniformExposure, this._config.display.exposure);
        this._gl.uniform1f(this._uniformGamma, this._config.display.gamma);
        this._gl.uniform1f(this._uniformBloomStrength, 0.04);
    }

    compose(layers: IRenderLayers) {
        this._gl.viewport(0, 0, this._resolution.x, this._resolution.y);

        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        this._combineShader.bind();

        this._gl.uniform1i(this._uniformColorBuffer, 0);
        this._gl.activeTexture(this._gl.TEXTURE0);
        this._gl.bindTexture(this._gl.TEXTURE_2D, layers.raw_color);

        this._gl.uniform1i(this._uniformBloomBuffer, 1);
        this._gl.activeTexture(this._gl.TEXTURE1);
        this._gl.bindTexture(this._gl.TEXTURE_2D, layers.pfx_bloom ?? null);

        new UBoolean(this._config.graphical.bloom).bindUniform(this._gl, this._uniformApplyBloom);
        Visualizer.instance.engine.renderer.renderQuad();
    }
};