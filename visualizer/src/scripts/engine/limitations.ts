
export class ImplementationLimitations {

    private _maxTextureSize: number;

    constructor() {
        this._maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    }

    get maxTextureSize() {
        return this._maxTextureSize;
    }

}