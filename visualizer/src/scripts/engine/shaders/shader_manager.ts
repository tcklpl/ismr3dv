import { Shader } from "./shader";

export class ShaderManager {

    private _shaders: Shader[] = [];

    registerShader(shader: Shader) {
        this._shaders.push(shader);
    }

    getByName(name: string) {
        return this._shaders.find(x => x.name == name);
    }

}