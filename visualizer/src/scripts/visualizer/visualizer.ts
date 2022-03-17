import { CameraManager } from "../engine/camera/camera_manager";
import { LookAtCamera } from "../engine/camera/lookat_camera";
import { Vec3 } from "../engine/data_formats/vec/vec3";
import { Engine } from "../engine/engine";
import { MaterialManager } from "../engine/materials/material_manager";
import { MeshManager } from "../engine/mesh_manager";
import { ObjectManager } from "../engine/object_manager";
import { Scene } from "../engine/scenes/scene";
import { SceneManager } from "../engine/scenes/scene_manager";
import { ShaderManager } from "../engine/shaders/shader_manager";
import { Loader } from "../loader/loader";
import { EarthRenderableObject } from "./objects/earth";

export class Visualizer {
    
    // Singleton
    private static _instance: Visualizer;

    // Main parts
    private _gl: WebGL2RenderingContext;
    private _loader: Loader;
    private _engine!: Engine;

    // Managers
    private _materialManager: MaterialManager = new MaterialManager();
    private _meshManager: MeshManager = new MeshManager();
    private _shaderManager: ShaderManager = new ShaderManager();
    private _objectManager: ObjectManager = new ObjectManager();
    private _cameraManager: CameraManager = new CameraManager();
    private _sceneManager: SceneManager = new SceneManager();

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
        Visualizer._instance = this;
        this._loader = new Loader();
        this._loader.onLoad = () => this.postLoad();
    }

    postLoad() {
        this._engine = new Engine();
        this._engine.adjustToWindowSize();

        const cam = new LookAtCamera(new Vec3(-3, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 0));
        this._cameraManager.register(cam);
        this._cameraManager.setActiveCamera(cam);

        const earth = this._objectManager.summon<EarthRenderableObject>("earth", EarthRenderableObject);
        earth.rotate(new Vec3(-1, 23.5, 90));
        const scene = new Scene("main");
        scene.objects.push(earth);
        this._sceneManager.active = scene;

        requestAnimationFrame(t => this._engine.render(t));
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

    public get shaderManager() {
        return this._shaderManager;
    }

    public get objectManager() {
        return this._objectManager;
    }

    public get cameraManager() {
        return this._cameraManager;
    }

    public get sceneManager() {
        return this._sceneManager;
    }

    public get engine() {
        return this._engine;
    }

}