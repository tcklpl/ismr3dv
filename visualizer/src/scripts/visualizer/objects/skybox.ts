import { Mat4 } from "../../engine/data_formats/mat/mat4";
import { Material } from "../../engine/materials/material";
import { Shader } from "../../engine/shaders/shader";

export class SkyboxRenderableObject {

    private _shader: Shader;
    private _material: Material;
    private _materialBindPoints: Map<string, WebGLUniformLocation> = new Map();

    private _view: WebGLUniformLocation;
    private _projection: WebGLUniformLocation;

    constructor(material: Material, shader: Shader) {
        this._shader = shader;
        this._material = material;
        shader.bind();
        this._materialBindPoints.set('diffuse', shader.assertGetUniform('u_skybox'));
        this._view = shader.assertGetUniform('u_view');
        this._projection = shader.assertGetUniform('u_projection');
    }

    bind(viewMatNoTranslation: Mat4, projectionMat: Mat4): void {
        this._shader.bind();
        this._material.bind(this._materialBindPoints);
        viewMatNoTranslation.bindUniform(gl, this._view);
        projectionMat.bindUniform(gl, this._projection);
    }
    
}