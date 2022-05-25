import { MUtils } from "../../utils/math_utils";
import { Vec3 } from "./vec3";

export class Vec4 extends Vec3 {

    constructor(x: number, y: number, z: number, w: number) {
        super(x, y, z);
        this._values[3] = w;
    }

    bindUniform(gl: WebGL2RenderingContext, to: WebGLUniformLocation): void {
        gl.uniform4fv(to, new Float32Array(this.values));
    }

    divide(factor: number) {
        this.x /= factor;
        this.y /= factor;
        this.z /= factor;
        this.w /= factor;
    }

    add(v: Vec4) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        this.w += v.w;
    }

    equals(other: Vec4) {
        return this.x == other.x && this.y == other.y && this.z == other.z && this.w == other.w;
    }

    multiplyByVec4(other: Vec4) {
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;
        this.w *= other.w;
        return this;
    }

    multiplyByFactor(f: number) {
        this.x *= f;
        this.y *= f;
        this.z *= f;
        this.w *= f;
        return this;
    }

    public get w() {
        return this._values[3];
    }

    public set w(v: number) {
        this._values[3] = v;
    }

    static fromId(id: number): Vec4 {
        return new Vec4(
            ((id >>  0) & 0xFF) / 0xFF,
            ((id >>  8) & 0xFF) / 0xFF,
            ((id >> 16) & 0xFF) / 0xFF,
            ((id >> 24) & 0xFF) / 0xFF
        );
    }

    static clamp(min: Vec4, max: Vec4, value: Vec4) {
        return new Vec4(
            MUtils.clamp(min.x, max.x, value.x),
            MUtils.clamp(min.y, max.y, value.y),
            MUtils.clamp(min.z, max.z, value.z),
            MUtils.clamp(min.w, max.w, value.w)
        );
    }

    static fromValue(val: number) {
        return new Vec4(val, val, val, val);
    }
}