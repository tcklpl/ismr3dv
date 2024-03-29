import { Skybox } from "../../visualizer/objects/skybox";
import { RenderableObject } from "../data_formats/renderable_object";

export class Scene {

    private _name: string;
    private _objects: RenderableObject[] = [];
    protected _skybox?: Skybox;

    private _cachedOpaqueObjects: RenderableObject[] = [];
    private _cachedTransparentObjects: RenderableObject[] = [];

    constructor(name: string) {
        this._name = name;
    }

    addObjects(...objs: RenderableObject[]) {
        this._objects.push(...objs);
        this.rebuildCache();
    }

    removeObjects(...objs: RenderableObject[]) {
        this._objects = this._objects.filter(x => !objs.some(o => o.id == x.id));
        this.rebuildCache();
    }

    protected rebuildCache() {
        this._cachedOpaqueObjects = this._objects.filter(x => !x.transparent && x.visible);
        this._cachedTransparentObjects = this._objects.filter(x => x.transparent && x.visible);
    }

    get name() {
        return this._name;
    }

    get objects() {
        return this._objects;
    }

    get opaqueObjects() {
        return this._cachedOpaqueObjects;
    }

    get transparentObjects() {
        return this._cachedTransparentObjects;
    }

    get skybox() {
        return this._skybox;
    }

}