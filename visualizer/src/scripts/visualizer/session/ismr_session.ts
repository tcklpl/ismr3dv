import { Vec3 } from "../../engine/data_formats/vec/vec3";
import { MUtils } from "../../engine/utils/math_utils";
import { IStationInfo } from "../api/formats/i_station_info";
import { StationRenderableObject } from "../objects/station";
import { Visualizer } from "../visualizer";

export class ISMRSession {

    private _creationDate: Date;
    private _startDate: Date;
    private _endDate: Date;

    private _objectManager = Visualizer.instance.objectManager;

    private _stationList?: IStationInfo[];
    private _instantiatedStations: StationRenderableObject[] = [];

    constructor(startDate: Date, endDate: Date, creationDate?: Date) {
        this._startDate = startDate;
        this._endDate = endDate;
        this._creationDate = creationDate ?? new Date();
    }

    instantiateStationsAs3dObjects() {
        if (!this._stationList) {
            console.warn('failed to instantiate empty station list');
            return;
        }

        this._stationList.forEach(s => {
            const instance = this._objectManager.summon("monitoring_station", StationRenderableObject);
            instance.stationId = s.station_id;
            instance.pickable = true;

            const pos = MUtils.latLongToUnitSphere(s.lat_, s.long_);
            instance.setPosition(pos);
            instance.setScale(Vec3.fromValue(0.3));
            instance.lookAt(Vec3.add(pos, pos));

            this._instantiatedStations.push(instance);
        });

        Visualizer.instance.universeScene.stations = this._instantiatedStations;
    }

    get startDate() {
        return this._startDate;
    }

    get endDate() {
        return this._endDate;
    }

    get stations() {
        return this._stationList;
    }

    set stations(s: IStationInfo[] | undefined) {
        this._stationList = s;
        this.instantiateStationsAs3dObjects();
    }

}