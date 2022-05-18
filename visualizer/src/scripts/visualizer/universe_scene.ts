import { Vec3 } from "../engine/data_formats/vec/vec3";
import { Scene } from "../engine/scenes/scene";
import { MainCamera } from "./camera/main_camera";
import { EarthRenderableObject } from "./objects/earth";
import { StationRenderableObject } from "./objects/station";
import { SunRenderableObject } from "./objects/sun";
import { Visualizer } from "./visualizer";

export class UniverseScene extends Scene {

    private _objectManager = Visualizer.instance.objectManager;

    private _earth!: EarthRenderableObject;
    private _sun!: SunRenderableObject;

    private _stations: StationRenderableObject[] = [];

    private _mainCamera!: MainCamera;

    private _isHoveringOverStation: boolean = false;

    constructor(name: string) {
        super(name);

        this._mainCamera = new MainCamera();

        this._earth = this._objectManager.summon("earth", EarthRenderableObject);
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

    get stations() {
        return this._stations;
    }

    set stations(s: StationRenderableObject[]) {
        this.removeObjects(...this._stations);
        this._stations = s;
        this.objects.push(...s);
    }

    get isHoveringOverStation() {
        return this._isHoveringOverStation;
    }

    set isHoveringOverStation(val: boolean) {
        $('#ismr3dcanvas').css('cursor', val ? 'pointer' : 'default');
        this._isHoveringOverStation = val;
    }

}