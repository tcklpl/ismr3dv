import { Material } from "../materials/material";
import { Shader } from "../shaders/shader";
import { Basic3DTransformative } from "../traits/basic_3d_transformative";
import { IIdentifiable } from "../traits/i_identifiable";
import { Mesh } from "./mesh/mesh";

export abstract class RenderableObject extends Basic3DTransformative implements IIdentifiable {
    
    _id: number;

    protected _mesh: Mesh;
    protected _material: Material;
    protected _shader: Shader;

    private _modelMat4Uniform: WebGLUniformLocation;
    private _viewMat4Uniform: WebGLUniformLocation;
    private _projectionMat4Uniform: WebGLUniformLocation;

    constructor(id: number, mesh: Mesh, material: Material, shader: Shader) {
        super();
        this._id = id;
        this._mesh = mesh;
        this._material = material;
        this._shader = shader;

        shader.bind();
        this._modelMat4Uniform = shader.assertGetUniform('u_model');
        this._viewMat4Uniform = shader.assertGetUniform('u_view');
        this._projectionMat4Uniform = shader.assertGetUniform('u_projection');
    }

    get id(): number {
        return this._id;
    }

    get u_model() {
        return this._modelMat4Uniform;
    }

    get u_view() {
        return this._viewMat4Uniform;
    }

    get u_projection() {
        return this._projectionMat4Uniform;
    }
    
    abstract render(uniformConfiguration: () => void): void;

}