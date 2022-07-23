import { EngineError } from "../../errors/engine_error";
import { IUniformable } from "../i_uniformable";
import { Mat4 } from "./mat4";

export class Mat3 implements IUniformable {

    values: number[] = new Array<number>(9);

    constructor(values: number[]) {
        if (values.length != 9) throw new Mat3Error(`Failed to create 3x3 matrix with ${values.length} values`);
        this.values = values;
    }

    bindUniform(gl: WebGL2RenderingContext, to: WebGLUniformLocation): void {
        gl.uniformMatrix3fv(to, false, new Float32Array(this.values));
    }

    set(row: number, col: number, value: number) {
        if (row < 0 || col < 0 || row > 2 || col > 2) throw new Mat3Error(`Cannot access position ${row}-${col} on a 3x3 matrix`);
        this.values[row * 3 + col] = value;
    }

    get(row: number, col: number): number {
        if (row < 0 || col < 0 || row > 2 || col > 2) throw new Mat3Error(`Cannot access position ${row}-${col} on a 3x3 matrix`);
        return this.values[row * 3 + col];
    }

    toMat4() {
        return new Mat4([
            this.values[0 * 3 + 0],
            this.values[0 * 3 + 1],
            this.values[0 * 3 + 2],
            0,
            this.values[1 * 3 + 0],
            this.values[1 * 3 + 1],
            this.values[1 * 3 + 2],
            0,
            this.values[2 * 3 + 0],
            this.values[2 * 3 + 1],
            this.values[2 * 3 + 2],
            0,
            0,
            0,
            0,
            1
        ]);
    }

    static identity(): Mat3 {
        return new Mat3([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);
    }
}

class Mat3Error extends EngineError {

    constructor(description: string) {
        super('3x3 Matrix', description);
    }
}
