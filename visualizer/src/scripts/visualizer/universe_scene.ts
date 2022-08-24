import { Vec3 } from "../engine/data_formats/vec/vec3";
import { Scene } from "../engine/scenes/scene";
import { MUtils } from "../engine/utils/math_utils";
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
        // sun starts at 8 * sin0, 0, 8*cos0
        this._sun.translate(new Vec3(0, 0, 8));

        this._ipp = this._objectManager.summon("ipp_sphere", IPPSphereEntity);
        this._ipp.scale(Vec3.fromValue(0.06));

        this._earth.registerChildren(this._ipp);

        this._skybox = new Skybox(this._materialManager.assertGetByName('stars'), this._shaderManager.assertGetShader('skybox'));

        this.addObjects(this._earth, this._sun, this._ipp);
        this.alignSunWithTime(new Date());
    }

    alignSunWithTime(t: Date) {
        // sun's defualt position @0,0,8 sits around GMT+6
        const utcHour = t.getUTCHours();
        const utcMins = t.getUTCMinutes();
        // 360 / 24 = each hour = 15 degrees
        const offsetHours = (utcHour + 6) % 24;
        const rotationDegrees = (offsetHours + (utcMins / 60)) * 15;
        const rotationDegreesRadians = MUtils.degToRad(rotationDegrees);
        const x = Math.sin(rotationDegreesRadians) * 16;
        const z = Math.cos(rotationDegreesRadians) * 16;
        this._sun.setPosition(new Vec3(x, 0, z));
        visualizer.ui.bottomHud.currentDateLabel = t.toLocaleString();
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