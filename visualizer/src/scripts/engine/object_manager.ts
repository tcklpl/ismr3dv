import { IObjectSource } from "./data_formats/i_source_object";
import { Mesh } from "./data_formats/mesh/mesh";
import { RenderableObject } from "./data_formats/renderable_object";
import { EngineError } from "./errors/engine_error";
import { GenericManager } from "./generic_manager";
import { Material } from "./materials/material";
import { Shader } from "./shaders/shader";

export class ObjectManager extends GenericManager<IObjectSource> {

    private _currentId = 0;

    private _instantiatedObjects: RenderableObject[] = [];

    private requestId() {
        return this._currentId++;
    }

    summon<T extends RenderableObject>(name: string, type: new (id: number, mesh: Mesh, material: Material, shader: Shader) => T) {
        let found = this.allRegistered.find(x => x.name == name);
        if (!found) throw new EngineError('Object Manager', `Could not find object '${name}'`);

        const ret = new type(this.requestId(), found.mesh, found.material, found.shader);
        this._instantiatedObjects.push(ret);
        return ret;
    }

    searchInstanceById(id: number) {
        return this._instantiatedObjects.find(x => x.id == id);
    }

    get allInstantiatedObjects() {
        return this._instantiatedObjects;
    }

    get allPiakcableObjects() {
        return this._instantiatedObjects.filter(x => x.pickable);
    }

}