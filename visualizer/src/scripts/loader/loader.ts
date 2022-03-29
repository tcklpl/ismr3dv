import { AsyncUtils } from "../engine/utils/async_utils";
import { UILoader } from "../ui/ui_loader";
import { HTMLLoader } from "./html_loader";
import { IHTMLLoadlist } from "./html_loadlist";
import { ILoadList } from "./loadlist";
import { LoadState } from "./load_states";
import { MaterialLoader } from "./material_loader";
import { MaterialLoadlist } from "./material_loadlist";
import { MeshLoader } from "./mesh_loader";
import { IMeshLoadlist } from "./mesh_loadlist";
import { ObjectLoader } from "./object_loader";
import { IObjectLoadlist } from "./object_loadlist";
import { ShaderLoader } from "./shader_loader";
import { IShaderLoadlist } from "./shader_loadlist";

export class Loader {

    private _htmlLoader!: HTMLLoader;
    private _materialLoader!: MaterialLoader;
    private _meshLoader!: MeshLoader;
    private _shaderLoader!: ShaderLoader;
    private _objectLoader!: ObjectLoader;

    private _loadedSources: number = 0;
    private _sourcesToLoad!: number;

    private _loadState: LoadState = LoadState.FETCHING_MAIN_LOADLIST;

    onLoad?: () => void;

    constructor() {
        this.fetchSources();
    }

    private fetchSources() {

        AsyncUtils.getUrlAs('loadlist.json', (res: ILoadList) => {
            this._sourcesToLoad = Object.keys(res).length;
            this.nextStage();

            AsyncUtils.getUrlAs(res.html_loadlist, (res: IHTMLLoadlist) => {
                this._htmlLoader = new HTMLLoader(res, () => this.nextStage(), () => this.nextStage());
                this.notifyFetchedSource();
            });

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

            AsyncUtils.getUrlAs(res.object_loadlist, (res: IObjectLoadlist) => {
                this._objectLoader = new ObjectLoader(res, () => this.nextStage(), () => this.nextStage());
                this.notifyFetchedSource();
            });
        });
    }

    private notifyFetchedSource() {
        if (++this._loadedSources == this._sourcesToLoad) this.nextStage();
    }

    private loadFinished() {
        UILoader.hideLoadingScreen();
        console.log('everything loaded!');
        if (this.onLoad)
            this.onLoad();
    }

    private updateUI(message: string) {
        let percentage = this._loadState.valueOf() / LoadState.FINISHED.valueOf() * 100;
        UILoader.updateStatus(percentage, message);
    }

    private nextStage() {
        switch(this._loadState) {
            case LoadState.FETCHING_MAIN_LOADLIST:
                this._loadState = LoadState.FETCHING_INDIVIDUAL_LOADLISTS;
                this.updateUI('Fetching loadlists');
                break;
            case LoadState.FETCHING_INDIVIDUAL_LOADLISTS:
                this._loadState = LoadState.FETCHING_HTML_PARTS;
                this.updateUI('Fetching HTML parts');
                this._htmlLoader.load();
                break;
            case LoadState.FETCHING_HTML_PARTS:
                this._loadState = LoadState.APPENDING_HTML_PARTS;
                this.updateUI('Appending HTML parts');
                this._htmlLoader.construct();
                break;
            case LoadState.APPENDING_HTML_PARTS:
                this._loadState = LoadState.FETCHING_MATERIALS;
                this.updateUI('Fetching materials');
                this._materialLoader.load();
                break;
            case LoadState.FETCHING_MATERIALS:
                this._loadState = LoadState.CONSTRUCTING_MATERIALS;
                this.updateUI('Constructing materials');
                this._materialLoader.construct();
                break;
            case LoadState.CONSTRUCTING_MATERIALS:
                this._loadState = LoadState.FETCHING_MESHES;
                this.updateUI('Fetching meshes');
                this._meshLoader.load();
                break;
            case LoadState.FETCHING_MESHES:
                this._loadState = LoadState.CONSTRUCTING_MESHES;
                this.updateUI('Constructing meshes');
                this._meshLoader.construct();
                break;
            case LoadState.CONSTRUCTING_MESHES:
                this._loadState = LoadState.FETCHING_SHADERS;
                this.updateUI('Fetching shaders');
                this._shaderLoader.load();
                break;
            case LoadState.FETCHING_SHADERS:
                this._loadState = LoadState.COMPILING_SHADERS;
                this.updateUI('Compiling shaders');
                this._shaderLoader.construct();
                break;
            case LoadState.COMPILING_SHADERS:
                this._loadState = LoadState.FETCHING_GAME_OBJECTS;
                this.updateUI('Fetching game objects');
                this._objectLoader.load();
                break;
            case LoadState.FETCHING_GAME_OBJECTS:
                this._loadState = LoadState.REGISTERING_GAME_OBJECTS;
                this.updateUI('Registering game objects');
                this._objectLoader.construct();
                break;
            case LoadState.REGISTERING_GAME_OBJECTS:
                this._loadState = LoadState.FINISHED;
                this.updateUI('Finished');
                this.loadFinished();
                break;
        }
    }

}