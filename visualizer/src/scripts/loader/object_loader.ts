import { IObjectSource } from "../engine/data_formats/i_source_object";
import { Material } from "../engine/materials/material";
import { GenericLoader } from "./generic_loader";
import { IObjectLoadlist } from "./object_loadlist";

export class ObjectLoader extends GenericLoader {

    private _loadlist!: IObjectLoadlist;

    private _meshManager = visualizer.meshManager;
    private _shaderManager = visualizer.shaderManager;
    private _materialManager = visualizer.materialManager;
    private _objectManager = visualizer.objectManager;

    private _sources: IObjectSource[] = [];

    protected initialize(): void {
        this._loadlist = this._source as IObjectLoadlist;
    }

    load(): void {

        this._loadlist.objects.forEach(o => {

           let mesh = this._meshManager.getByName(o.mesh);
           if (!mesh) throw `Invalid mesh when creating object ${o.name}`;

           let shader = this._shaderManager.getByName(o.shader);
           if (!shader) throw `Invalid shader when creating object ${o.name}`;

           let material = o.material ? this._materialManager.getByName(o.material) : new Material("none", new Map(), false);
           if (!material) throw `Invalid material when creating object ${o.name}`;

            this._sources.push({
                name: o.name,
                mesh: mesh,
                shader: shader,
                material: material
            });
        });

        this.onLoad();
    }

    construct(): void {
        
        this._sources.forEach(s => {
            this._objectManager.register(s);
        });

        this.onConstruct();
    }
    
}