import { Vec3 } from "../engine/data_formats/vec/vec3";
import { Scene } from "../engine/scenes/scene";
import { MainCamera } from "./camera/main_camera";
import { EarthRenderableObject } from "./objects/earth";
import { IPPRenderableObject } from "./objects/ipp_renderer";
import { SkyboxRenderableObject } from "./objects/skybox";
import { StationRenderableObject } from "./objects/station";
import { SunRenderableObject } from "./objects/sun";
import { Visualizer } from "./visualizer";

export class UniverseScene extends Scene {

    private _objectManager = Visualizer.instance.objectManager;
    private _materialManager = Visualizer.instance.materialManager;
    private _shaderManager = Visualizer.instance.shaderManager;

    private _earth!: EarthRenderableObject;
    private _sun!: SunRenderableObject;
    private _ipp!: IPPRenderableObject;

    private _stations: StationRenderableObject[] = [];

    private _mainCamera!: MainCamera;

    private _isHoveringOverStation: boolean = false;

    constructor(name: string) {
        super(name);

        this._mainCamera = new MainCamera();

        this._earth = this._objectManager.summon("earth", EarthRenderableObject);

        this._sun = this._objectManager.summon("sun", SunRenderableObject);
        this._sun.translate(new Vec3(8, 0, 8));

        this._ipp = this._objectManager.summon("ipp_sphere", IPPRenderableObject);
        this._ipp.scale(new Vec3(0.02, 0.02, 0.02));

        this._skybox = new SkyboxRenderableObject(this._materialManager.assertGetByName('stars'), this._shaderManager.assertGetShader('skybox'));

        this.addObjects(this._earth, this._sun, this._ipp);
    }

    get earth() {
        return this._earth;
    }

    get sun() {
        return this._sun;
    }

    get ippSphere() {
        return this._ipp;
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
        this.addObjects(...s);
    }

    get isHoveringOverStation() {
        return this._isHoveringOverStation;
    }

    set isHoveringOverStation(val: boolean) {
        $('#ismr3dcanvas').css('cursor', val ? 'pointer' : 'default');
        this._isHoveringOverStation = val;
    }

}