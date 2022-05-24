import { Line } from "./line";

export class LineLoop extends Line {

    draw() {
        this.bindVAO();
        this._gl.drawArrays(this._gl.LINE_LOOP, 0, this._points.length);
    }
}