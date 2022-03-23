import { Mat4 } from "../data_formats/mat/mat4";
import { Vec3 } from "../data_formats/vec/vec3";

export abstract class Camera {

    protected _pos: Vec3;
    protected _up: Vec3;

    protected _cameraMatrix!: Mat4;

    constructor(pos: Vec3, up: Vec3) {
        this._pos = pos;
        this._up = up;
    }

    abstract generateCameraMatrix(): void;

    public get matrix() {
        return this._cameraMatrix;
    }

    get position() {
        return this._pos;
    }
}