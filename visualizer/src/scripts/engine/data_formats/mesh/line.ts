import { BufferUtils } from "../../utils/buffer_utils";
import { Vec3 } from "../vec/vec3";

export class Line {

    protected _points: Vec3[];

    private _bufPoints: WebGLBuffer;
    private _vao: WebGLVertexArrayObject;

    constructor(points: Vec3[], drawMode?: number) {
        this._points = points;
        drawMode = drawMode ?? gl.STATIC_DRAW;

        this._bufPoints = BufferUtils.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._bufPoints);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._points.flatMap(p => p.values)), drawMode);

        this._vao = BufferUtils.createVAO();
        gl.bindVertexArray(this._vao);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this._bufPoints);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
    }

    bindVAO() {
        gl.bindVertexArray(this._vao);
    }

    draw() {
        this.bindVAO();
        gl.drawArrays(gl.LINES, 0, this._points.length);
    }

}