import { Shader } from "../shaders/shader";
import { Basic3DTransformative } from "../traits/basic_3d_transformative";

export class MatrixCompliant3DTransformative extends Basic3DTransformative {

    private _modelMat4Uniform: WebGLUniformLocation;
    private _viewMat4Uniform: WebGLUniformLocation;
    private _projectionMat4Uniform: WebGLUniformLocation;

    private _shader: Shader;

    constructor(shader: Shader) {
        super();
        this._shader = shader;

        shader.bind();
        this._modelMat4Uniform = shader.assertGetUniform('u_model');
        this._viewMat4Uniform = shader.assertGetUniform('u_view');
        this._projectionMat4Uniform = shader.assertGetUniform('u_projection');
    }

    get shader() {
        return this._shader;
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

}