import { GenericManager } from "../generic_manager";
import { Material } from "./material";

export class MaterialManager extends GenericManager<Material> {

    public getByName(name: string) {
        return this.allRegistered.find(x => x.name == name);
    }

}