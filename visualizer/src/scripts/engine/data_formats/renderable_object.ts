import { Visualizer } from "../../visualizer/visualizer";
import { Material } from "../materials/material";
import { Shader } from "../shaders/shader";
import { Basic3DTransformative } from "../traits/basic_3d_transformative";
import { IIdentifiable } from "../traits/i_identifiable";
import { Mesh } from "./mesh/mesh";
import { Vec4 } from "./vec/vec4";

export abstract class RenderableObject extends Basic3DTransformative implements IIdentifiable {
    
    _id: number;
    private _idVec4: Vec4;
    private _zeroVec4 = Vec4.fromValue(0);
    private _pickable = false;

    protected _mesh: Mesh;
    protected _material: Material;
    protected _shader: Shader;

    private _modelMat4Uniform: WebGLUniformLocation;
    private _viewMat4Uniform: WebGLUniformLocation;
    private _projectionMat4Uniform: WebGLUniformLocation;

    private _hasPickingSetup = false;
    private _pickingModelMat4Uniform!: WebGLUniformLocation;
    private _pickingViewMat4Uniform!: WebGLUniformLocation;
    private _pickingProjectionMat4Uniform!: WebGLUniformLocation;

    constructor(id: number, mesh: Mesh, material: Material, shader: Shader) {
        super();
        this._id = id;
        this._idVec4 = Vec4.fromId(id);
        this._mesh = mesh;
        this._material = material;
        this._shader = shader;

        shader.bind();
        this._modelMat4Uniform = shader.assertGetUniform('u_model');
        this._viewMat4Uniform = shader.assertGetUniform('u_view');
        this._projectionMat4Uniform = shader.assertGetUniform('u_projection');
    }

    abstract render(uniformConfiguration: () => void): void;

    renderPicking(shader: Shader, idUniform: WebGLUniformLocation, uniformConfiguration: () => void) {
        shader.bind();

        if (!this._hasPickingSetup) {
            this._pickingModelMat4Uniform = shader.assertGetUniform('u_model');
            this._pickingViewMat4Uniform = shader.assertGetUniform('u_view');
            this._pickingProjectionMat4Uniform = shader.assertGetUniform('u_projection');
            this._hasPickingSetup = true;
        }

        this.modelMatrix.bindUniform(Visualizer.instance.gl, this._pickingModelMat4Uniform);
        (this._pickable ? this._idVec4 : this._zeroVec4).bindUniform(Visualizer.instance.gl, idUniform);
        uniformConfiguration();
        this._mesh.draw();
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

    get u_pickingModel() {
        return this._pickingModelMat4Uniform;
    }

    get u_pickingView() {
        return this._pickingViewMat4Uniform;
    }

    get u_pickingProjection() {
        return this._pickingProjectionMat4Uniform;
    }

    get idVec4() {
        return this._idVec4;
    }
    
    get pickable() {
        return this._pickable;
    }

    set pickable(p: boolean) {
        this._pickable = p;
    }

}