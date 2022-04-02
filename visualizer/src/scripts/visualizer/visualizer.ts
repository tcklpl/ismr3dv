import { CameraManager } from "../engine/camera/camera_manager";
import { ConfigurationManager } from "../engine/config/configuration_manager";
import { Engine } from "../engine/engine";
import { MaterialManager } from "../engine/materials/material_manager";
import { MeshManager } from "../engine/mesh_manager";
import { ObjectManager } from "../engine/object_manager";
import { SceneManager } from "../engine/scenes/scene_manager";
import { ShaderManager } from "../engine/shaders/shader_manager";
import { Loader } from "../loader/loader";
import { UIConfig } from "../ui/ui_config";
import { UIInfo } from "../ui/ui_info";
import { VisualizerIO } from "./io/visualizer_io";
import { UniverseScene } from "./universe_scene";

export class Visualizer {
    
    // Singleton
    private static _instance: Visualizer;

    // Main parts
    private _gl: WebGL2RenderingContext;
    private _loader: Loader;
    private _engine!: Engine;
    private _io!: VisualizerIO;

    // Managers
    private _materialManager: MaterialManager = new MaterialManager();
    private _meshManager: MeshManager = new MeshManager();
    private _shaderManager: ShaderManager = new ShaderManager();
    private _objectManager: ObjectManager = new ObjectManager();
    private _cameraManager: CameraManager = new CameraManager();
    private _sceneManager: SceneManager = new SceneManager();
    private _configurationManager: ConfigurationManager = new ConfigurationManager();

    private _pointerLocked: boolean = false;

    // Scene
    private _universeScene!: UniverseScene;

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
        Visualizer._instance = this;

        this._configurationManager.loadConfiguration();
        this._configurationManager.saveConfigurations();

        this._loader = new Loader();
        this._loader.onLoad = () => this.postLoad();
    }

    postLoad() {
        this._engine = new Engine();
        this._engine.adjustToWindowSize();

        this._io = new VisualizerIO();

        this._universeScene = new UniverseScene("universe");
        this._cameraManager.setActiveCamera(this._universeScene.mainCamera);
        this._sceneManager.active = this._universeScene;

        UIConfig.registerEvents();
        UIInfo.update();

        requestAnimationFrame(t => this._engine.render(t));
    }

    get gl() {
        return this._gl;
    }

    public static get instance() {
        return this._instance;
    }

    get materialManager() {
        return this._materialManager;
    }

    get meshManager() {
        return this._meshManager;
    }

    get shaderManager() {
        return this._shaderManager;
    }

    get objectManager() {
        return this._objectManager;
    }

    get cameraManager() {
        return this._cameraManager;
    }

    get sceneManager() {
        return this._sceneManager;
    }

    get configurationManager() {
        return this._configurationManager;
    }

    get engine() {
        return this._engine;
    }

    get io() {
        return this._io;
    }

    get pointerLocked() {
        return this._pointerLocked;
    }

    public set pointerLocked(v: boolean) {
        this._pointerLocked = v;
    }

    get universeScene() {
        return this._universeScene;
    }


}