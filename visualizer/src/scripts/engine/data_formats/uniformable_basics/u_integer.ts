import { IUniformable } from "../i_uniformable";

export class UInteger implements IUniformable {

    private _value: number;

    constructor(value: number) {
        this._value = value;
    }

    bindUniform(gl: WebGL2RenderingContext, to: WebGLUniformLocation): void {
        gl.uniform1i(to, this._value);
    }

    get value() {
        return this._value;
    }

    set value(v: number) {
        this._value = v;
    }

}