import { Visualizer } from "../../../visualizer/visualizer";
import { UBoolean } from "../../data_formats/uniformable_basics/u_boolean";
import { Vec2 } from "../../data_formats/vec/vec2";
import { Shader } from "../../shaders/shader";
import { IRenderLayers } from "../i_render_layers";
import { IRenderProvider } from "../i_render_provider";
import { IRenderSettings } from "../i_render_settings";

export class RenderComposer implements IRenderProvider {

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
        gl.uniform1f(this._uniformExposure, this._config.display.exposure);
        gl.uniform1f(this._uniformGamma, this._config.display.gamma);
        gl.uniform1f(this._uniformBloomStrength, 0.04);
    }

    compose(layers: IRenderLayers) {
        gl.viewport(0, 0, this._resolution.x, this._resolution.y);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this._combineShader.bind();

        gl.uniform1i(this._uniformColorBuffer, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, layers.raw_color);

        gl.uniform1i(this._uniformBloomBuffer, 1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, layers.pfx_bloom ?? null);

        new UBoolean(this._config.graphical.bloom).bindUniform(gl, this._uniformApplyBloom);
        Visualizer.instance.engine.renderer.renderQuad();
    }
};