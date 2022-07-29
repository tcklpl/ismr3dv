import { Mat4 } from "./mat/mat4";

export class Quaternion {

    w: number;
    x: number;
    y: number;
    z: number;

    constructor(w: number, x: number, y: number, z: number) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getAsMatrix() {
        const w2 = this.w * this.w;
        const x2 = this.x * this.x;
        const y2 = this.y * this.y;
        const z2 = this.z * this.z;

        const wx = this.w * this.x;
        const wy = this.w * this.y;
        const wz = this.w * this.z;
        const xy = this.x * this.y;
        const xz = this.x * this.z;
        const yz = this.y * this.z;
        return new Mat4([
            2 * (w2 + x2) - 1   , 2 * (xy + wz)     , 2 * (xy - wy)     , 0,
            2 * (xy - wz)       , 2 * (w2 + y2) - 1 , 2 * (yz + wx)     , 0,
            2 * (xz + wy)       , 2 * (yz - wx)     , 2 * (w2 + z2) - 1 , 0,
            0                   , 0                 , 0                 , 1
        ]);
    }
    
    /**
     * Creates a Quaternion from euler angles
     * @param x roll in radians
     * @param y pitch in radians
     * @param z yaw in radians
     */
    static fromEulerAngles(x: number, y: number, z: number) {
        const cosYaw = Math.cos(z / 2);
        const sinYaw = Math.sin(z / 2);
        const cosPitch = Math.cos(y / 2);
        const sinPitch = Math.sin(y / 2);
        const cosRoll = Math.cos(x / 2);
        const sinRoll = Math.sin(x / 2);

        return new Quaternion(
            cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw,
            sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw,
            cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw,
            cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw
        );
    }

    static slerp(a: Quaternion, b: Quaternion) {
        
    }

}