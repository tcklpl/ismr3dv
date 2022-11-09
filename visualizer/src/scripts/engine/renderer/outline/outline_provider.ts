import { Camera } from "../../camera/camera";
import { Vec3 } from "../../data_formats/vec/vec3";
import { Scene } from "../../scenes/scene";
import { Shader } from "../../shaders/shader";
import { IRenderPostProcessingProvider } from "../i_prender_post_processing_provider";
import { IRenderLayers } from "../i_render_layers";
import { IRenderSettings } from "../i_render_settings";

export class OutlineProvider implements IRenderPostProcessingProvider {

    private _shader!: Shader;
    private _colorUniform!: WebGLUniformLocation;
    color = Vec3.fromValue(1);

    private _modelMat4Uniform!: WebGLUniformLocation;
    private _viewMat4Uniform!: WebGLUniformLocation;
    private _projectionMat4Uniform!: WebGLUniformLocation;

    setup(settings: IRenderSettings): void {
        this._shader = visualizer.shaderManager.assertGetShader('outline');
        this._colorUniform = this._shader.assertGetUniform('u_color');

        this._modelMat4Uniform = this._shader.assertGetUniform('u_model');
        this._viewMat4Uniform = this._shader.assertGetUniform('u_view');
        this._projectionMat4Uniform = this._shader.assertGetUniform('u_projection');
    }

    render(layers: IRenderLayers): void {
        const scene = visualizer.sceneManager.active as Scene;
        const camera = visualizer.cameraManager.activeCamera as Camera;
        const perspective = visualizer.engine.renderer.perspectiveProjectionMat4;

        this._shader.bind();

        gl.stencilFunc(gl.NOTEQUAL, 1, 0xFF);
        gl.stencilMask(0x00);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

        this.color.bindUniform(gl, this._colorUniform);
        scene.opaqueObjects.filter(x => x.outline).forEach(o => {
            o.renderOutline(this._modelMat4Uniform, () => {
                camera.viewMat.bindUniform(gl, this._viewMat4Uniform);
                perspective.bindUniform(gl, this._projectionMat4Uniform);
            });
        });

    }

    updateForResolution(width: number, height: number): void {
    }
    
}