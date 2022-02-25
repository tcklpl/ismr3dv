import { AsyncUtils } from "../engine/utils/async_utils";
import { TextureUtils } from "../engine/utils/texture_utils";
import { Visualizer } from "../visualizer/visualizer";
import { GenericLoader } from "./generic_loader";
import { MaterialLoadlist } from "./material_loadlist";
import { Material } from "../engine/materials/material";

interface MaterialSource {
    name: string;
    maps: Map<string, HTMLImageElement>;
    totalToLoad: number;
}

export class MaterialLoader extends GenericLoader {

    private _loadList!: MaterialLoadlist;
    private _sources: MaterialSource[] = [];

    private _gl = Visualizer.instance.gl;
    private _materialManager = Visualizer.instance.materialManager;

    protected initialize() {
        this._loadList = this._source as MaterialLoadlist;
    }

    /**
     * First method to be called, will load everithing with AJAX calls from jQuery
     */
    load(): void {

        this._loadList.materials.forEach(mat => {
            
            // first check if all resolutions and maps are present
            mat.resolutions.forEach(res => {
                let resolution = mat.images.find(x => x.resolution == res);
                if (!resolution) throw `Incomplete material '${mat.name}': Missing texture resolution '${res}'`;
                mat.maps.forEach(map => {
                    if (!resolution?.maps[map]) throw `Incomplete material '${mat.name}': Missing texture map '${res}'`;
                });
            });

            // now check if the default resolution is in the resolution list
            if (!mat.resolutions.find(x => x == mat.default_resolution)) throw `Error when loading material '${mat.name}': Invalid default resolution '${mat.default_resolution}'`;

            // now everything is ok, we can load the map
            let source = <MaterialSource>{
                name: mat.name,
                maps: new Map(),
                totalToLoad: mat.maps.length
            }
            this._sources.push(source);

            // TODO: load other resolutions
            let resToLoad = mat.images.find(x => x.resolution == mat.default_resolution) as { resolution: string, maps: any};

            // now we can load all the maps
            mat.maps.forEach(map => {
                AsyncUtils.getImage(`materials/${resToLoad.maps[map]}`, img => {
                    source.maps.set(map, img);
                    this.notifyLoad();
                });
            });
        });
    }

    private notifyLoad() {

        let loaded = true;
        this._sources.forEach(s => {
            if (s.maps.size < s.totalToLoad)
                loaded = false;
        });
        if (loaded) {
            this.onLoad();
        }
    }

    /**
     * Second method in the pipeline, will construct WebGLTextures from each loaded image
     */
    construct() {
        this._sources.forEach(s => {
            const finalMap = new Map<string, WebGLTexture>();
            s.maps.forEach((value, key) => {
                finalMap.set(key, TextureUtils.createTextureFromImage(this._gl, value));
            });
            this._materialManager.registerMaterial(new Material(s.name, finalMap));
        });
        this.onConstruct();
    }
    

    
}