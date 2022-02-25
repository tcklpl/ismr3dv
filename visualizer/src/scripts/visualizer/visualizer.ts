import { MaterialManager } from "../engine/materials/material_manager";
import { MeshManager } from "../engine/mesh_manager";
import { Loader } from "../loader/loader";

export class Visualizer {
    
    // Singleton
    private static _instance: Visualizer;

    // Main parts
    private _gl: WebGL2RenderingContext;
    private _loader: Loader;

    // Managers
    private _materialManager: MaterialManager = new MaterialManager();
    private _meshManager: MeshManager = new MeshManager();

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
        Visualizer._instance = this;
        this._loader = new Loader();
    }

    public get gl() {
        return this._gl;
    }

    public static get instance() {
        return this._instance;
    }

    public get materialManager() {
        return this._materialManager;
    }

    public get meshManager() {
        return this._meshManager;
    }

}