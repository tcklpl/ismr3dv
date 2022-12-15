import { CameraManager } from "../engine/camera/camera_manager";
import { ConfigurationManager } from "../config/configuration_manager";
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
import { UI } from "../ui/ui";
import { ISMRAPIConnector } from "./api/api_connector";
import { IServerInfo } from "./api/formats/i_server_info";
import { IPPFetcher } from "./data/ipp_fetcher";
import { EventHandler } from "./events/event_handler";
import { GizmoManager } from "./gizmos/gizmo_manager";
import { VisualizerIO } from "./io/visualizer_io";
import { ISMRSession } from "./session/ismr_session";
import { UniverseScene } from "./universe_scene";
import { IGRFFetcher } from "./igrf/igrf_fetcher";
import { SessionLoader } from "./session/loading/session_loader";
import { ColorPrograms } from "./session/moments/colorers/color_programs/color_programs";
import { IGRFLineBuilder } from "./igrf/igrf_line_builder";

export class Visualizer {

    // Main parts
    private _loader!: Loader;
    private _engine!: Engine;
    private _io!: VisualizerIO;
    private _ui = new UI();
    private _idb = new IDBManager();
    private _limitations!: ImplementationLimitations;
    private _eventHandler = new EventHandler();
    private _ippFetcher = new IPPFetcher();
    private _igrfFetcher: IGRFFetcher;
    private _sessionLoader = new SessionLoader();
    private _igrfLineBuilder!: IGRFLineBuilder;

    // Managers
    private _materialManager = new MaterialManager();
    private _meshManager = new MeshManager();
    private _shaderManager = new ShaderManager();
    private _objectManager = new ObjectManager();
    private _cameraManager = new CameraManager();
    private _sceneManager = new SceneManager();
    private _configurationManager = new ConfigurationManager();
    private _interactionManager!: InteractionManager;
    private _gizmoManager!: GizmoManager;

    // Api
    private _api = new ISMRAPIConnector();
    private _session?: ISMRSession;
    private _serverInfo!: IServerInfo;

    private _pointerLocked: boolean = false;
    private _pointerLockListeners: ((lock: boolean) => void)[] = [];

    // Scene
    private _universeScene!: UniverseScene;

    constructor() {
        globalThis.visualizer = this;
        this._io = new VisualizerIO();

        this._limitations = new ImplementationLimitations();

        this._api.fetchServerInfo()
        .then(si => this._serverInfo = si)
        .catch(() => {
            throw `Failed to fetch server info`;
        });

        this._igrfFetcher = new IGRFFetcher();

        this.idb.onReady(() => {
            this._configurationManager.loadConfiguration();
            this._configurationManager.onLoad = () => {
                this._configurationManager.saveConfigurations();
                this.initializeLoad();
            }
        });
    }

    private initializeLoad() {
        this.ui.registerEssential();

        this._loader = new Loader();
        this._loader.onLoad = () => this.postLoad();
    }

    postLoad() {
        this._interactionManager = new InteractionManager();
        this._gizmoManager = new GizmoManager();

        this._engine = new Engine();
        this._engine.adjustToWindowSize();

        this._universeScene = new UniverseScene("universe");
        this._cameraManager.setActiveCamera(this._universeScene.mainCamera);
        this._sceneManager.active = this._universeScene;

        ColorPrograms.build();
        this.ui.registerEvents();

        this._igrfFetcher.loadModel();
        this._igrfLineBuilder = new IGRFLineBuilder();

        requestAnimationFrame(t => this._engine.render(t));
    }

    registerPointerLockListener(l: (lock: boolean) => void) {
        this._pointerLockListeners.push(l);
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
        this._pointerLockListeners.forEach(x => x(v));
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

    get idb() {
        return this._idb;
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

    get events() {
        return this._eventHandler;
    }

    get ippFetcher() {
        return this._ippFetcher;
    }

    get sessionLoader() {
        return this._sessionLoader;
    }

    get igrfFetcher() {
        return this._igrfFetcher;
    }

    get igrfLineBuilder() {
        return this._igrfLineBuilder;
    }

}