import { Visualizer } from "../../visualizer/visualizer";
import { Material } from "../materials/material";
import { Shader } from "../shaders/shader";
import { IIdentifiable } from "../traits/i_identifiable";
import { MatrixCompliant3DTransformative } from "./matrix_compliant_3d_transformative";
import { Mesh } from "./mesh/mesh";
import { Vec4 } from "./vec/vec4";

export abstract class RenderableObject extends MatrixCompliant3DTransformative implements IIdentifiable {
    
    _id: number;
    private _idVec4: Vec4;
    private _zeroVec4 = Vec4.fromValue(0);
    private _pickable = false;
    private _transparent = false;

    protected _mesh: Mesh;
    protected _material: Material;

    private _hasPickingSetup = false;
    private _pickingModelMat4Uniform!: WebGLUniformLocation;
    private _pickingViewMat4Uniform!: WebGLUniformLocation;
    private _pickingProjectionMat4Uniform!: WebGLUniformLocation;

    constructor(id: number, mesh: Mesh, material: Material, shader: Shader) {
        super(shader);
        this._id = id;
        this._idVec4 = Vec4.fromId(id);
        this._mesh = mesh;
        this._material = material;
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

    get transparent() {
        return this._transparent;
    }

    set transparent(v: boolean) {
        this._transparent = v;
    }

    get mesh() {
        return this._mesh;
    }
}