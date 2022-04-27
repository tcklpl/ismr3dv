import { Visualizer } from "../../visualizer/visualizer";
import { UBoolean } from "../data_formats/uniformable_basics/u_boolean";
import { Vec2 } from "../data_formats/vec/vec2";
import { Shader } from "../shaders/shader";
import { IRenderLayers } from "./i_render_layers";
import { IRenderProvider } from "./i_render_provider";
import { IRenderSettings } from "./i_render_settings";

export class RenderComposer implements IRenderProvider {

    private _gl = Visualizer.instance.gl;
    private _shaderManager = Visualizer.instance.shaderManager;
    private _config = Visualizer.instance.configurationManager.graphical;

    private _resolution!: Vec2;

    private _postProcessCombineShader!: Shader;
    private _ppcsUniformColorBuffer!: WebGLUniformLocation;
    private _ppcsUniformBloomBuffer!: WebGLUniformLocation;
    private _ppcsUniformApplyBloom!: WebGLUniformLocation;

    setup(settings: IRenderSettings): void {
        this._resolution = new Vec2(settings.width, settings.height);

        this._postProcessCombineShader = this._shaderManager.getByName('post_process_combine') as Shader;
        this._ppcsUniformColorBuffer = this._postProcessCombineShader.assertGetUniform('u_color_buffer');
        this._ppcsUniformBloomBuffer = this._postProcessCombineShader.assertGetUniform('u_bloom_buffer');
        this._ppcsUniformApplyBloom = this._postProcessCombineShader.assertGetUniform('u_bloom');
    }

    updateForResolution(width: number, height: number): void {
        this._resolution.x = width;
        this._resolution.y = height;
    }

    compose(layers: IRenderLayers) {
        this._gl.viewport(0, 0, this._resolution.x, this._resolution.y);

        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        this._postProcessCombineShader.bind();

        this._gl.uniform1i(this._ppcsUniformColorBuffer, 0);
        this._gl.activeTexture(this._gl.TEXTURE0);
        this._gl.bindTexture(this._gl.TEXTURE_2D, layers.raw_color);

        this._gl.uniform1i(this._ppcsUniformBloomBuffer, 1);
        this._gl.activeTexture(this._gl.TEXTURE1);
        this._gl.bindTexture(this._gl.TEXTURE_2D, layers.pfx_bloom ?? null);

        new UBoolean(this._config.bloom).bindUniform(this._gl, this._ppcsUniformApplyBloom);
        Visualizer.instance.engine.renderer.renderQuad();
    }
};