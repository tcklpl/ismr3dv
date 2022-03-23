import { Vec3 } from "../engine/data_formats/vec/vec3";
import { Scene } from "../engine/scenes/scene";
import { MainCamera } from "./camera/main_camera";
import { EarthRenderableObject } from "./objects/earth";
import { SunRenderableObject } from "./objects/sun";
import { Visualizer } from "./visualizer";

export class UniverseScene extends Scene {

    private _objectManager = Visualizer.instance.objectManager;

    private _earth!: EarthRenderableObject;
    private _sun!: SunRenderableObject;

    private _mainCamera!: MainCamera;

    constructor(name: string) {
        super(name);

        this._mainCamera = new MainCamera();

        this._earth = this._objectManager.summon("earth", EarthRenderableObject);
        this._earth.rotate(new Vec3(-1, 23.5, 90));
        this.objects.push(this._earth);

        this._sun = this._objectManager.summon("sun", SunRenderableObject);
        this._sun.translate(new Vec3(8, 0, 8));
        this.objects.push(this._sun);
    }

    get earth() {
        return this._earth;
    }

    get sun() {
        return this._sun;
    }

    get mainCamera() {
        return this._mainCamera;
    }

}