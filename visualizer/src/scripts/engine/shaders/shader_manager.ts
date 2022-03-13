import { GenericManager } from "../generic_manager";
import { Shader } from "./shader";

export class ShaderManager extends GenericManager<Shader> {

    getByName(name: string) {
        return this.allRegistered.find(x => x.name == name);
    }

}