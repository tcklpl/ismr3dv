import { EngineError } from "../errors/engine_error";
import { GenericManager } from "../generic_manager";
import { Shader } from "./shader";

export class ShaderManager extends GenericManager<Shader> {

    getByName(name: string) {
        return this.allRegistered.find(x => x.name == name);
    }

    assertGetShader(name: string) {
        const res = this.getByName(name);
        if (!res) throw new EngineError('Shader Manager', `Failed to assert and get shader '${name}'`);
        return res;
    }

}