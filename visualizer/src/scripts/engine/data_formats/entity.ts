import { Basic3DTransformative } from "../traits/basic_3d_transformative";
import { RenderableObject } from "./renderable_object";

export abstract class Entity extends RenderableObject {
    
    private _children: Basic3DTransformative[] = [];

    registerChildren(...children: Basic3DTransformative[]) {
        children.forEach(c => {
            c.parent = this;
            this._children.push(c);
        });
    }

    removeChildren(...children: Basic3DTransformative[]) {
        children.forEach(c => {
            c.parent = undefined;
        });
        this._children = this._children.filter(x => !children.find(y => x === y));
    }

    clearChildren() {
        this._children = [];
    }

    get children() {
        return this._children;
    }

}