import { Mat3 } from "../data_formats/mat/mat3";
import { Mat4 } from "../data_formats/mat/mat4";
import { Vec3 } from "../data_formats/vec/vec3";

export abstract class Camera {

    protected _pos: Vec3;
    protected _up: Vec3;

    protected _cameraMatrix!: Mat4;
    protected _cameraMatrixNoTranslation!: Mat4;

    constructor(pos: Vec3, up: Vec3) {
        this._pos = pos;
        this._up = up;
    }

    abstract generateCameraMatrix(): void;

    get matrix() {
        return this._cameraMatrix;
    }

    get matrixNoTranslation() {
        return this._cameraMatrixNoTranslation;
    }

    get position() {
        return this._pos;
    }
}