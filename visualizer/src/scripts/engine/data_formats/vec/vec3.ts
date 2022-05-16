import { MUtils } from "../../utils/math_utils";
import { Vec2 } from "./vec2";

export class Vec3 extends Vec2 {

    constructor(x: number, y: number, z: number) {
        super(x, y);
        this._values[2] = z;
    }

    bindUniform(gl: WebGL2RenderingContext, to: WebGLUniformLocation): void {
        gl.uniform3fv(to, new Float32Array(this.values));
    }

    equals(other: Vec3) {
        return this.x == other.x && this.y == other.y && this.z == other.z;
    }

    add(v: Vec3) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
    }

    divide(factor: number) {
        this.x /= factor;
        this.y /= factor;
        this.z /= factor;
    }

    public get z() {
        return this._values[2];
    }

    public set z(v: number) {
        this._values[2] = v;
    }

    static get zero() {
        return new Vec3(0, 0, 0);
    }

    static cross(a: Vec3, b: Vec3): Vec3 {
        return new Vec3(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }

    static add(a: Vec3, b: Vec3): Vec3 {
        return new Vec3(
            a.x + b.x,
            a.y + b.y,
            a.z + b.z
        );
    }

    static subtract(a: Vec3, b: Vec3): Vec3 {
        return new Vec3(
            a.x - b.x,
            a.y - b.y,
            a.z - b.z
        );
    }

    static multiplyByValue(a: Vec3, b: number) {
        return new Vec3(
            a.x * b,
            a.y * b,
            a.z * b
        )
    }

    static normalize(v: Vec3) {
        let length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        // no division by 0
        return length > 0.00001 ? new Vec3(v.x / length, v.y / length, v.z / length) : new Vec3(0, 0, 0);
    }

    static centroid(v: Vec3[]): Vec3 {
        let accumulated = v.reduce((accumulated, current) => Vec3.add(accumulated, current), Vec3.fromValue(0));
        accumulated.divide(v.length);
        return accumulated;
    }

    static clamp(min: Vec3, max: Vec3, value: Vec3) {
        return new Vec3(
            MUtils.clamp(min.x, max.x, value.x),
            MUtils.clamp(min.y, max.y, value.y),
            MUtils.clamp(min.z, max.z, value.z)
        );
    }

    static fromValue(val: number) {
        return new Vec3(val, val, val);
    }

}