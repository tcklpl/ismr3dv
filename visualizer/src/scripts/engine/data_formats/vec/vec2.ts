import { MUtils } from "../../utils/math_utils";
import { IUniformable } from "../i_uniformable";

export class Vec2 implements IUniformable {

    protected _values: number[];

    constructor(x: number, y: number) {
        this._values = [x, y];
    }

    bindUniform(gl: WebGL2RenderingContext, to: WebGLUniformLocation): void {
        gl.uniform2fv(to, new Float32Array(this.values));
    }

    sum(x: number, y: number) {
        x += x;
        y += y;
    }

    addVec2(other: Vec2) {
        this.sum(other.x, other.y);
    }

    differentFrom(other: Vec2) {
        return this.x != other.x || this.y != other.y;
    }

    public get values() {
        return this._values;
    }

    public get x() {
        return this._values[0];
    }

    public set x(v: number) {
        this._values[0] = v;
    }

    public get y() {
        return this._values[1];
    }

    public set y(v: number) {
        this._values[1] = v;
    }

    static subtract(a: Vec2, b: Vec2): Vec2 {
        return new Vec2(
            a.x - b.x,
            a.y - b.y
        );
    }

    static clamp(min: Vec2, max: Vec2, value: Vec2) {
        return new Vec2(
            MUtils.clamp(min.x, max.x, value.x),
            MUtils.clamp(min.y, max.y, value.y)
        );
    }

    static fromValue(val: number) {
        return new Vec2(val, val);
    }

}