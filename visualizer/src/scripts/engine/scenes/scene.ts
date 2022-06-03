import { RenderableObject } from "../data_formats/renderable_object";

export class Scene {

    private _name: string;
    private _objects: RenderableObject[] = [];

    constructor(name: string) {
        this._name = name;
    }

    removeObjects(...objs: RenderableObject[]) {
        this._objects = this._objects.filter(x => !objs.some(o => o.id == x.id));
    }

    get name() {
        return this._name;
    }

    get objects() {
        return this._objects;
    }

    get opaqueObjects() {
        return this._objects.filter(x => !x.transparent);
    }

    get transparentObjects() {
        return this._objects.filter(x => x.transparent);
    }

}