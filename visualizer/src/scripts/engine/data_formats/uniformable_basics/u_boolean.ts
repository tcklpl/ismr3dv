import { IUniformable } from "../i_uniformable";

export class UBoolean implements IUniformable {

    private _value: boolean;

    constructor(value: boolean) {
        this._value = value;
    }

    bindUniform(gl: WebGL2RenderingContext, to: WebGLUniformLocation): void {
        gl.uniform1i(to, this._value ? 1 : 0);
    }

    get value() {
        return this._value;
    }

    set value(v: boolean) {
        this._value = v;
    }

}