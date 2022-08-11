import { Mat4 } from "../data_formats/mat/mat4";
import { Vec3 } from "../data_formats/vec/vec3";
import { IPositionable } from "../traits/i_positionable";
import { Camera } from "./camera";

export class LookAtCamera extends Camera implements IPositionable {

    protected _target: Vec3;

    constructor(pos: Vec3, up: Vec3, target: Vec3) {
        super(pos, up);
        this._target = target;
        this.generateCameraMatrix();
    }

    setPosition(pos: Vec3): void {
        this._pos = pos;
        this.generateCameraMatrix();
    }
    
    translate(to: Vec3): void {
        this._pos.add(to);
        this.generateCameraMatrix();
    }

    generateCameraMatrix(): void {
        this.cameraMatrix = Mat4.lookAt(this._pos, this._target, this._up);
    }
    
    get asSerializable(): any {
        return {
            type: "lookat"
        }
    }
}