import { EngineError } from "../errors/engine_error";
import { TextureUtils } from "../utils/texture_utils";

export class Material {
    
    private _name: string;
    protected _maps: Map<string, WebGLTexture>;
    private _cubemap: boolean;

    constructor(name: string, textureMaps: Map<string, HTMLImageElement>, cubemap: boolean) {
        this._name = name;
        this._cubemap = cubemap;

        this._maps = new Map();
        if (cubemap) {
            const maps: HTMLImageElement[] = [];
            textureMaps.forEach(v => maps.push(v));
            
            this._maps.set('diffuse', TextureUtils.createCubemap(maps));
        } else {
            textureMaps.forEach((v, k) => this._maps.set(k, TextureUtils.createTextureFromImage(v)));
        }

    }

    get name() {
        return this._name;
    }

    get maps() {
        return this._maps;
    }

    get isCubemap() {
        return this._cubemap;
    }

    bind(map: Map<string, WebGLUniformLocation>) {
        
        let toSet: Map<WebGLUniformLocation, WebGLTexture> = new Map();

        map.forEach((v, k) => {

            let texture = this._maps.get(k);
            if (!texture) throw new EngineError('Material', `Failed to get texture '${k}' from material '${this._name}'`);

            toSet.set(v, texture);
        });

        let i = 0;
        toSet.forEach((v, k) => {
            gl.uniform1i(k, i);
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(this._cubemap ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D, v);
            i++;
        })
    }
}