import { IUniformable } from "../i_uniformable";

export class UFloat implements IUniformable {

    private _value: number;

    constructor(value: number) {
        this._value = value;
    }

    bindUniform(gl: WebGL2RenderingContext, to: WebGLUniformLocation): void {
        gl.uniform1f(to, this._value);
    }

    get value() {
        return this._value;
    }

    set value(v: number) {
        this._value = v;
    }

}