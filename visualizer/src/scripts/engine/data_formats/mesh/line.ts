import { Visualizer } from "../../../visualizer/visualizer";
import { BufferUtils } from "../../utils/buffer_utils";
import { Vec3 } from "../vec/vec3";

export class Line {

    protected _points: Vec3[];
    protected _gl = Visualizer.instance.gl;

    private _bufPoints: WebGLBuffer;
    private _vao: WebGLVertexArrayObject;

    constructor(points: Vec3[], drawMode?: number) {
        this._points = points;
        drawMode = drawMode ?? this._gl.STATIC_DRAW;

        this._bufPoints = BufferUtils.createBuffer(this._gl);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufPoints);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(this._points.flatMap(p => p.values)), drawMode);

        this._vao = BufferUtils.createVAO(this._gl);
        this._gl.bindVertexArray(this._vao);
        
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufPoints);
        this._gl.vertexAttribPointer(0, 3, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(0);
    }

    bindVAO() {
        this._gl.bindVertexArray(this._vao);
    }

    draw() {
        this.bindVAO();
        this._gl.drawArrays(this._gl.LINES, 0, this._points.length);
    }

}