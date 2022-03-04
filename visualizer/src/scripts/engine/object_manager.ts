import { IObjectSource } from "./data_formats/i_source_object";
import { Mesh } from "./data_formats/mesh/mesh";
import { RenderableObject } from "./data_formats/renderable_object";
import { Material } from "./materials/material";
import { Shader } from "./shaders/shader";

export class ObjectManager {

    private _currentId = 0;
    private _objects: IObjectSource[] = [];

    private requestId() {
        return this._currentId++;
    }

    registerObject(obj: IObjectSource) {
        this._objects.push(obj);
    }

    summon<T extends RenderableObject>(name: string, type: (id: number, mesh: Mesh, material: Material, shader: Shader) => T) {
        let found = this._objects.find(x => x.name == name);
        if (!found) throw `Could not find object '${name}'`;

        return type(this.requestId(), found.mesh, found.material, found.shader);
    }

}