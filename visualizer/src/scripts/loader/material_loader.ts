import { AsyncUtils } from "../engine/utils/async_utils";
import { GenericLoader } from "./generic_loader";
import { MaterialLoadlist } from "./material_loadlist";
import { Material } from "../engine/materials/material";
import { EngineError } from "../engine/errors/engine_error";

interface MaterialSource {
    name: string;
    maps: Map<string, HTMLImageElement>;
    totalToLoad: number;
    cubemap: boolean;
}

export class MaterialLoader extends GenericLoader {

    private _loadList!: MaterialLoadlist;
    private _sources: MaterialSource[] = [];
    private _config = visualizer.configurationManager.graphical;

    private _materialManager = visualizer.materialManager;

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
                totalToLoad: mat.maps.length,
                cubemap: mat.cube_map
            }
            this._sources.push(source);

            // TODO: load other resolutions
            let resToLoad: string = (this._config as any)[`${mat.name}_texture_size`] || mat.default_resolution;
            let mapsToLoad = mat.images.find(x => x.resolution == resToLoad) as { resolution: string, maps: any};

            // now we can load all the maps
            mat.maps.forEach(map => {
                AsyncUtils.getImage(`materials/${mapsToLoad.maps[map]}`, img => {
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
            // validate cubemaps
            const orderedCubemapMaps: Map<string, HTMLImageElement> = new Map();
            if (s.cubemap) {
                const requirements = ['pos_x', 'neg_x', 'pos_y', 'neg_y', 'pos_z', 'neg_z'];
                requirements.forEach(r => {
                    if (!s.maps.has(r)) throw new EngineError('Material Loader', `Incomplete cubemap: '${s.name}'`);
                    orderedCubemapMaps.set(r, s.maps.get(r) as HTMLImageElement);
                });
            }
            this._materialManager.register(new Material(s.name, s.cubemap ? orderedCubemapMaps : s.maps, s.cubemap));
        });
        this.onConstruct();
    }
    

    
}