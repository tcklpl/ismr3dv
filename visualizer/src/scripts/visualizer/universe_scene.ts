import { Vec3 } from "../engine/data_formats/vec/vec3";
import { Scene } from "../engine/scenes/scene";
import { MainCamera } from "./camera/main_camera";
import { EarthEntity } from "./objects/earth";
import { IPPSphereEntity } from "./objects/ipp_renderer";
import { Skybox } from "./objects/skybox";
import { StationEntity } from "./objects/station";
import { SunEntity } from "./objects/sun";

export class UniverseScene extends Scene {

    private _objectManager = visualizer.objectManager;
    private _materialManager = visualizer.materialManager;
    private _shaderManager = visualizer.shaderManager;

    private _earth!: EarthEntity;
    private _sun!: SunEntity;
    private _ipp!: IPPSphereEntity;

    private _stations: StationEntity[] = [];

    private _mainCamera!: MainCamera;

    private _isHoveringOverStation: boolean = false;

    constructor(name: string) {
        super(name);

        this._mainCamera = new MainCamera();

        this._earth = this._objectManager.summon("earth", EarthEntity);

        this._sun = this._objectManager.summon("sun", SunEntity);
        this._sun.translate(new Vec3(8, 0, 8));

        this._ipp = this._objectManager.summon("ipp_sphere", IPPSphereEntity);
        this._ipp.scale(new Vec3(0.02, 0.02, 0.02));

        this._earth.registerChildren(this._ipp);

        this._skybox = new Skybox(this._materialManager.assertGetByName('stars'), this._shaderManager.assertGetShader('skybox'));

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

    set stations(s: StationEntity[]) {
        this.removeObjects(...this._stations);
        this._earth.removeChildren(...this._stations);
        this._stations = s;
        this.addObjects(...s);
        this._earth.registerChildren(...s);
    }

    get isHoveringOverStation() {
        return this._isHoveringOverStation;
    }

    set isHoveringOverStation(val: boolean) {
        $('#ismr3dcanvas').css('cursor', val ? 'pointer' : 'default');
        this._isHoveringOverStation = val;
    }

}