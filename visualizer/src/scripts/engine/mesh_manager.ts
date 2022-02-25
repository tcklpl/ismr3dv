import { Mesh } from "./data_formats/mesh/mesh";

export class MeshManager {

    private _meshes: Mesh[] = [];

    public getByName(name: string) {
        return this._meshes.find(x => x.name == name);
    }

    public registerMesh(m: Mesh) {
        this._meshes.push(m);
    }

    public get meshes() {
        return this._meshes;
    }

}