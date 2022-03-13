import { Mesh } from "./data_formats/mesh/mesh";
import { GenericManager } from "./generic_manager";

export class MeshManager extends GenericManager<Mesh> {


    getByName(name: string) {
        return this.allRegistered.find(x => x.name == name);
    }

}