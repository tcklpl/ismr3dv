import { RenderableObject } from "../data_formats/renderable_object";

export class Scene {

    private _name: string;
    private _objects: RenderableObject[] = [];

    constructor(name: string) {
        this._name = name;
    }

    get name() {
        return this._name;
    }

    get objects() {
        return this._objects;
    }

}