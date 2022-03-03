import { Material } from "../materials/material";
import { Shader } from "../shaders/shader";
import { Basic3DTransformative } from "../traits/basic_3d_transformative";
import { IIdentifiable } from "../traits/i_identifiable";
import { Mesh } from "./mesh/mesh";

export abstract class RenderableOBject extends Basic3DTransformative implements IIdentifiable {
    
    _id: number;

    protected _mesh: Mesh;
    protected _material: Material;
    protected _shader: Shader;

    constructor(id: number, mesh: Mesh, material: Material, shader: Shader) {
        super();
        this._id = id;
        this._mesh = mesh;
        this._material = material;
        this._shader = shader;
    }

    get id(): number {
        return this._id;
    }
    
    abstract render(): void;

}