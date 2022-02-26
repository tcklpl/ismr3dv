import { AsyncUtils } from "../engine/utils/async_utils";
import { ILoadList } from "./loadlist";
import { LoadState } from "./load_states";
import { MaterialLoader } from "./material_loader";
import { MaterialLoadlist } from "./material_loadlist";
import { MeshLoader } from "./mesh_loader";
import { IMeshLoadlist } from "./mesh_loadlist";
import { ShaderLoader } from "./shader_loader";
import { IShaderLoadlist } from "./shader_loadlist";

export class Loader {

    private _materialLoader!: MaterialLoader;
    private _meshLoader!: MeshLoader;
    private _shaderLoader!: ShaderLoader;

    private _loadedSources: number = 0;
    private _sourcesToLoad!: number;

    private _loadState: LoadState = LoadState.FETCHING_MAIN_LOADLIST;

    constructor() {
        this.fetchSources();
    }

    private fetchSources() {

        AsyncUtils.getUrlAs('loadlist.json', (res: ILoadList) => {
            this._sourcesToLoad = Object.keys(res).length;
            this.nextStage();

            AsyncUtils.getUrlAs(res.material_loadlist, (res: MaterialLoadlist) => {
                this._materialLoader = new MaterialLoader(res, () => this.nextStage(), () => this.nextStage());
                this.notifyFetchedSource();
            });

            AsyncUtils.getUrlAs(res.mesh_loadlist, (res: IMeshLoadlist) => {
                this._meshLoader = new MeshLoader(res, () => this.nextStage(), () => this.nextStage());
                this.notifyFetchedSource();
            });

            AsyncUtils.getUrlAs(res.shader_loadlist, (res: IShaderLoadlist) => {
                this._shaderLoader = new ShaderLoader(res, () => this.nextStage(), () => this.nextStage());
                this.notifyFetchedSource();
            });
        });
    }

    private notifyFetchedSource() {
        if (++this._loadedSources == this._sourcesToLoad) this.nextStage();
    }

    private loadFinished() {
        console.log('everything loaded!');
    }

    private nextStage() {
        switch(this._loadState) {
            case LoadState.FETCHING_MAIN_LOADLIST:
                this._loadState = LoadState.FETCHING_INDIVIDUAL_LOADLISTS;
                break;
            case LoadState.FETCHING_INDIVIDUAL_LOADLISTS:
                this._loadState = LoadState.FETCHING_MATERIALS;
                this._materialLoader.load();
                break;
            case LoadState.FETCHING_MATERIALS:
                this._loadState = LoadState.CONSTRUCTING_MATERIALS;
                this._materialLoader.construct();
                break;
            case LoadState.CONSTRUCTING_MATERIALS:
                this._loadState = LoadState.FETCHING_MESHES;
                this._meshLoader.load();
                break;
            case LoadState.FETCHING_MESHES:
                this._loadState = LoadState.CONSTRUCTING_MESHES;
                this._meshLoader.construct();
                break;
            case LoadState.CONSTRUCTING_MESHES:
                this._loadState = LoadState.FETCHING_SHADERS;
                this._shaderLoader.load();
                break;
            case LoadState.FETCHING_SHADERS:
                this._loadState = LoadState.COMPILING_SHADERS;
                this._shaderLoader.construct();
                break;
            case LoadState.COMPILING_SHADERS:
                this._loadState = LoadState.FINISHED;
                this.loadFinished();
                break;
        }
    }

}