
export class Material {
    
    private _name: string;
    private _maps: Map<string, WebGLTexture>;

    constructor(name: string, textureMaps: Map<string, WebGLTexture>) {
        this._name = name;
        this._maps = textureMaps;
    }

    public get name() {
        return this._name;
    }
}