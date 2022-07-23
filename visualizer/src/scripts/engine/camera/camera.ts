import { Mat3 } from "../data_formats/mat/mat3";
import { Mat4 } from "../data_formats/mat/mat4";
import { Vec3 } from "../data_formats/vec/vec3";

export abstract class Camera {

    protected _pos: Vec3;
    protected _up: Vec3;

    private _cameraMatrix!: Mat4;
    private _viewMatrix!: Mat4;
    private _viewMatrixNoTranslation!: Mat4;

    constructor(pos: Vec3, up: Vec3) {
        this._pos = pos;
        this._up = up;
    }

    abstract generateCameraMatrix(): void;

    protected set cameraMatrix(mat: Mat4) {
        this._cameraMatrix = mat;
        this._viewMatrix = Mat4.inverse(mat);
        this._viewMatrixNoTranslation = this._viewMatrix.duplicate().topLeftCornerTo3x3().toMat4();
    }

    get viewMat() {
        return this._viewMatrix;
    }

    get viewMatNoTranslation() {
        return this._viewMatrixNoTranslation;
    }

    get position() {
        return this._pos;
    }
}