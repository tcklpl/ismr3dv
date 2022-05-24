import { GenericManager } from "../generic_manager";
import { Shader } from "./shader";

export class ShaderManager extends GenericManager<Shader> {

    getByName(name: string) {
        return this.allRegistered.find(x => x.name == name);
    }

    assertGetShader(name: string) {
        const res = this.getByName(name);
        if (!res) throw `Failed to get shader '${name}'`;
        return res;
    }

}