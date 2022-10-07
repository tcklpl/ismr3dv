import { Vec3 } from "../engine/data_formats/vec/vec3";
import { Scene } from "../engine/scenes/scene";
import { MUtils } from "../engine/utils/math_utils";
import { MainCamera } from "./camera/main_camera";
import { EarthEntity } from "./objects/earth";
import { IPPSphereEntity } from "./objects/ipp_renderer";
import { SatelliteEntity } from "./objects/satellite";
import { Skybox } from "./objects/skybox";
import { StationEntity } from "./objects/station";
import { SunEntity } from "./objects/sun";
import { ISMRSession } from "./session/ismr_session";

export class UniverseScene extends Scene {

    private _objectManager = visualizer.objectManager;
    private _materialManager = visualizer.materialManager;
    private _shaderManager = visualizer.shaderManager;

    private _earth!: EarthEntity;
    private _sun!: SunEntity;
    private _ipp!: IPPSphereEntity;

    private _stations: StationEntity[] = [];
    private _satellites: SatelliteEntity[] = [];

    private _mainCamera!: MainCamera;

    private _isHoveringOverStation: boolean = false;

    constructor(name: string) {
        super(name);

        this._mainCamera = new MainCamera();

        this._earth = this._objectManager.summon("earth", EarthEntity);

        this._sun = this._objectManager.summon("sun", SunEntity);
        // sun starts at cos0, 0, sin0
        this._sun.translate(new Vec3(16, 0, 0));

        this._ipp = this._objectManager.summon("ipp_sphere", IPPSphereEntity);
        this._ipp.scale(Vec3.fromValue(0.06));

        this._earth.registerChildren(this._ipp);

        this._skybox = new Skybox(this._materialManager.assertGetByName('stars'), this._shaderManager.assertGetShader('skybox'));

        this.addObjects(this._earth, this._sun, this._ipp);
        this.alignSunWithTime(new Date());
    }

    alignSunWithTime(t: Date) {
        // sun's defualt position @8,0,0 sits around GMT-12
        const utcHour = t.getUTCHours();
        const utcMins = t.getUTCMinutes();
        // 360 / 24 = each hour = 15 degrees
        const offsetHours = (utcHour + 12) % 24;
        const rotationDegrees = (offsetHours + (utcMins / 60)) * 15;
        const rotationDegreesRadians = MUtils.degToRad(rotationDegrees);
        const x = -Math.cos(rotationDegreesRadians) * 16;
        const z = -Math.sin(rotationDegreesRadians) * 16;
        this._sun.setPosition(new Vec3(x, 0, z));
        visualizer.ui.bottomHud.currentDateLabel = t.toLocaleString();
    }

    updateSatellites(positions: Map<string, Vec3>) {
        const curMoment = (visualizer.session as ISMRSession).timeline.currentMoment;
        this.satellites.forEach(s => {
            const contains = positions.has(s.curInfo.name);
            s.visible = contains;
            if (contains) {
                const position = (positions.get(s.curInfo.name) as Vec3).clone().multiplyByFactor(1.2);
                s.setPosition(position);
                s.lookAt(Vec3.fromValue(0));
                s.curInfo.value = curMoment.ippPerSatellite.get(s.curInfo.name) as number;
            }
        });
        this.rebuildCache();
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

    get satellites() {
        return this._satellites;
    }

    set satellites(s: SatelliteEntity[]) {
        this.removeObjects(...this._satellites);
        this._earth.removeChildren(...this._satellites);
        this._satellites = s;
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