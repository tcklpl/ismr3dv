import { Visualizer } from "../visualizer/visualizer";

export class ImplementationLimitations {

    private _gl = Visualizer.instance.gl;

    private _maxTextureSize: number;

    constructor() {
        this._maxTextureSize = this._gl.getParameter(this._gl.MAX_TEXTURE_SIZE);
    }

    get maxTextureSize() {
        return this._maxTextureSize;
    }

}