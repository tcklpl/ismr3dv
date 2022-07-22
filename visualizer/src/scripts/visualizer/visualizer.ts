import { CameraManager } from "../engine/camera/camera_manager";
import { ConfigurationManager } from "../engine/config/configuration_manager";
import { Engine } from "../engine/engine";
import { InteractionManager } from "../engine/interactions/interaction_manager";
import { ImplementationLimitations } from "../engine/limitations";
import { MaterialManager } from "../engine/materials/material_manager";
import { MeshManager } from "../engine/mesh_manager";
import { ObjectManager } from "../engine/object_manager";
import { SceneManager } from "../engine/scenes/scene_manager";
import { ShaderManager } from "../engine/shaders/shader_manager";
import { IDBManager } from "../indexeddb/idb_manager";
import { Loader } from "../loader/loader";
import { StorageController } from "../local_storage/storage_controller";
import { UI } from "../ui/ui";
import { ISMRAPIConnector } from "./api/api_connector";
import { IServerInfo } from "./api/formats/i_server_info";
import { ISMRCacheHub } from "./cache/cache_hub";
import { GizmoManager } from "./gizmos/gizmo_manager";
import { VisualizerIO } from "./io/visualizer_io";
import { ISMRProviders } from "./providers/providers";
import { ISMRSession } from "./session/ismr_session";
import { UniverseScene } from "./universe_scene";

export class Visualizer {
    
    // Singleton
    private static _instance: Visualizer;

    // Main parts
    private _gl: WebGL2RenderingContext;
    private _loader: Loader;
    private _engine!: Engine;
    private _io!: VisualizerIO;
    private _ui = new UI();
    private _cache!: ISMRCacheHub;
    private _idb = new IDBManager();
    private _limitations!: ImplementationLimitations;

    // Managers
    private _materialManager = new MaterialManager();
    private _meshManager = new MeshManager();
    private _shaderManager = new ShaderManager();
    private _objectManager = new ObjectManager();
    private _cameraManager = new CameraManager();
    private _sceneManager = new SceneManager();
    private _storageController = new StorageController();
    private _configurationManager = new ConfigurationManager();
    private _interactionManager!: InteractionManager;
    private _gizmoManager!: GizmoManager;

    // Api
    private _api = new ISMRAPIConnector();
    private _providers!: ISMRProviders;
    private _session?: ISMRSession;
    private _serverInfo!: IServerInfo;

    private _pointerLocked: boolean = false;

    // Scene
    private _universeScene!: UniverseScene;

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
        Visualizer._instance = this;
        this._io = new VisualizerIO();

        this._configurationManager.loadConfiguration();
        this._configurationManager.saveConfigurations();

        this._limitations = new ImplementationLimitations();
        this.ui.registerEssential();

        this._api.fetchServerInfo()
        .then(si => this._serverInfo = si)
        .catch(() => {
            throw `Failed to fetch server info`;
        });

        this._loader = new Loader();
        this._loader.onLoad = () => this.postLoad();
    }

    postLoad() {
        this._interactionManager = new InteractionManager();
        this._gizmoManager = new GizmoManager();

        this._engine = new Engine();
        this._engine.adjustToWindowSize();

        this._cache = new ISMRCacheHub();
        this._providers = new ISMRProviders();

        this._universeScene = new UniverseScene("universe");
        this._cameraManager.setActiveCamera(this._universeScene.mainCamera);
        this._sceneManager.active = this._universeScene;

        this.ui.registerEvents();

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

    get storageController() {
        return this._storageController;
    }

    get interactionManager() {
        return this._interactionManager;
    }

    get gizmoManager() {
        return this._gizmoManager;
    }

    get engine() {
        return this._engine;
    }

    get io() {
        return this._io;
    }

    get ui() {
        return this._ui;
    }

    get pointerLocked() {
        return this._pointerLocked;
    }

    set pointerLocked(v: boolean) {
        this._pointerLocked = v;
    }

    get universeScene() {
        return this._universeScene;
    }

    get api() {
        return this._api;
    }

    get session() {
        return this._session;
    }

    get cache() {
        return this._cache;
    }

    get idb() {
        return this._idb;
    }

    get providers() {
        return this._providers;
    }

    set session(s: ISMRSession | undefined) {
        this._session = s;
    }

    get serverInfo() {
        return this._serverInfo;
    }

    get limitations() {
        return this._limitations;
    }


}