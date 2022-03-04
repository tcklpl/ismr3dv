import { Visualizer } from "../../visualizer/visualizer";

export class Material {
    
    private _name: string;
    protected _maps: Map<string, WebGLTexture>;

    constructor(name: string, textureMaps: Map<string, WebGLTexture>) {
        this._name = name;
        this._maps = textureMaps;
    }

    public get name() {
        return this._name;
    }

    public get maps() {
        return this._maps;
    }

    bind(map: Map<string, WebGLUniformLocation>) {
        const gl = Visualizer.instance.gl;
        
        let toSet: Map<WebGLUniformLocation, WebGLTexture> = new Map();

        map.forEach((v, k) => {

            let texture = this._maps.get(k);
            if (!texture) throw `Failed to get texture '${k}' from material '${this._name}'`;

            toSet.set(v, texture);
        });

        let i = 0;
        toSet.forEach((v, k) => {
            gl.uniform1i(k, i);
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, v);
        })
    }
}