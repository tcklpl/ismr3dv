import { IObjectSource } from "./data_formats/i_source_object";
import { Mesh } from "./data_formats/mesh/mesh";
import { RenderableObject } from "./data_formats/renderable_object";
import { GenericManager } from "./generic_manager";
import { Material } from "./materials/material";
import { Shader } from "./shaders/shader";

export class ObjectManager extends GenericManager<IObjectSource> {

    private _currentId = 0;

    private requestId() {
        return this._currentId++;
    }

    summon<T extends RenderableObject>(name: string, type: (id: number, mesh: Mesh, material: Material, shader: Shader) => T) {
        let found = this.allRegistered.find(x => x.name == name);
        if (!found) throw `Could not find object '${name}'`;

        return type(this.requestId(), found.mesh, found.material, found.shader);
    }

}