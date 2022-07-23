import { EngineError } from "../errors/engine_error";
import { GenericManager } from "../generic_manager";
import { Material } from "./material";

export class MaterialManager extends GenericManager<Material> {

    public getByName(name: string) {
        return this.allRegistered.find(x => x.name == name);
    }

    assertGetByName(name: string) {
        const res = this.getByName(name);
        if (!res) throw new EngineError('Material Manager', `Failed to get material '${name}'`);
        return res;
    }

}