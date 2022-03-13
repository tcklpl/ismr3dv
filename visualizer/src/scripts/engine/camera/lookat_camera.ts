import { Mat4 } from "../data_formats/mat/mat4";
import { Vec3 } from "../data_formats/vec/vec3";
import { Camera } from "./camera";

export class LookAtCamera extends Camera {

    protected _target: Vec3;

    constructor(pos: Vec3, up: Vec3, target: Vec3) {
        super(pos, up);
        this._target = target;
        this.generateCameraMatrix();
    }

    generateCameraMatrix(): void {
        this._cameraMatrix = Mat4.lookAt(this._pos, this._target, this._up);
        this._cameraMatrix = Mat4.inverse(this._cameraMatrix);
    }
    
}