import { Material } from "./material";

export class MaterialManager {

    private _materials: Material[] = [];

    registerMaterial(mat: Material) {
        this._materials.push(mat);
    }

    public getByName(name: string) {
        return this._materials.find(x => x.name == name);
    }

    public get allMaterials() {
        return this._materials;
    }

}