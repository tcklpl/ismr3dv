import { Line } from "./line";

export class LineLoop extends Line {

    draw() {
        this.bindVAO();
        gl.drawArrays(gl.LINE_LOOP, 0, this._points.length);
    }
}