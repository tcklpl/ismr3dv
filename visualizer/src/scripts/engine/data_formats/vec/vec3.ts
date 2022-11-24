import { MUtils } from "../../utils/math_utils";
import { Vec2 } from "./vec2";

export class Vec3 extends Vec2 {

    static up = new Vec3(0, 1, 0);
    static forward = new Vec3(0, 0, -1);

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

    multiplyByVec3(other: Vec3) {
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;
        return this;
    }

    multiplyByFactor(f: number) {
        this.x *= f;
        this.y *= f;
        this.z *= f;
        return this;
    }

    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    checkIfAllValuesInRange(min: number, max: number) {
        return this.x >= min && this.x <= max && this.y >= min && this.y <= max && this.z >= min && this.z <= max;
    }

    squaredNorm() {
        return this.x**2 + this.y**2 + this.z**2;
    }

    normalize() {
        let length = Math.sqrt(this.squaredNorm());
        if (length >  0.00001) {
            this.x /= length;
            this.y /= length;
            this.z /= length;
        } else {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        return this;
    }

    inverse() {
        this.x *= -1;
        this.y *= -1;
        this.z *= -1;
        return this;
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

    static interpolate(a: Vec3, b: Vec3, n: number) {
        const xDiff = a.x - b.x;
        const yDiff = a.y - b.y;
        const zDiff = a.z - b.z;
        return new Vec3(a.x + (xDiff * n), a.y + (yDiff * n), a.z + (zDiff * n));
    }

    static dot(a: Vec3, b: Vec3) {
        return (
            a.x * b.x +
            a.y * b.y +
            a.z * b.z
        );
    }

}