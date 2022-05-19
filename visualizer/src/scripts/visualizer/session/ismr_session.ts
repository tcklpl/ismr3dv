import { Vec3 } from "../../engine/data_formats/vec/vec3";
import { MUtils } from "../../engine/utils/math_utils";
import { CustomAlert } from "../../ui/custom_alert";
import { IStationInfo } from "../api/formats/i_station_info";
import { StationRenderableObject } from "../objects/station";
import { Visualizer } from "../visualizer";
import { ISessionConfig } from "./i_session.config";
import { ISessionSave } from "./i_session_save";
import { StationColors } from "./station_colors";

export class ISMRSession {

    private _name: string;
    private _creationDate: Date;
    private _startDate: Date;
    private _endDate: Date;

    private _controller = Visualizer.instance.idb.sessionController;

    private _config: ISessionConfig = {
        save_on_browser: true,
        auto_save: true,
        auto_save_interval_minutes: 5
    };
    private _autoSaveTask: number = -1;

    private _objectManager = Visualizer.instance.objectManager;

    private _stationList?: IStationInfo[];
    private _instantiatedStations: StationRenderableObject[] = [];
    private _selectedStations: IStationInfo[] = [];

    constructor(startDate: Date, endDate: Date, name?: string, creationDate?: Date) {
        this._startDate = startDate;
        this._endDate = endDate;
        this._creationDate = creationDate ?? new Date();
        this._name = name && name.length > 0 ? name : `${this._creationDate?.toDateString()} - ${startDate.toDateString()} to ${endDate.toDateString()}`;
    }

    instantiateStationsAs3dObjects() {
        if (!this._stationList) {
            console.warn('failed to instantiate empty station list');
            return;
        }

        this._stationList.forEach(s => {
            const instance = this._objectManager.summon("monitoring_station", StationRenderableObject);
            instance.stationInfo = s;
            instance.pickable = true;

            const pos = MUtils.latLongToUnitSphere(s.lat_, s.long_);
            instance.setPosition(pos);
            instance.setScale(Vec3.fromValue(0.3));
            instance.lookAt(Vec3.add(pos, pos));

            this._instantiatedStations.push(instance);
        });

        Visualizer.instance.universeScene.stations = this._instantiatedStations;
    }

    autoSave() {
        if (!this._config.save_on_browser) return;
        this._autoSaveTask = setTimeout(() => {
            this._autoSaveTask = -1;
            this.save();
            this.autoSave();
        }, this._config.auto_save_interval_minutes * 60 * 1000);
    }

    save() {
        if (!this._config.save_on_browser) return;

        // check if an auto save task is currently running
        if (this._autoSaveTask >= 0) {
            clearTimeout(this._autoSaveTask);
            this._autoSaveTask = -1;
            this.autoSave();
        }

        this._controller.put(this.asSerializable)
        .then(() => {
            new CustomAlert('success', 'Session saved!', 1);
        })
        .catch(() => {
            new CustomAlert('danger', 'Failed to save the session', 5);
        });
    }

    notifyStationClick(station: StationRenderableObject) {
        if (this._selectedStations.includes(station.stationInfo)) {
            this._selectedStations = this._selectedStations.filter(x => x != station.stationInfo);
            station.colorLocked = false;
            station.color = StationColors.IDLE;
        } else {
            this._selectedStations.push(station.stationInfo);
            station.color = StationColors.SELECTED;
            station.colorLocked = true;
        }
        Visualizer.instance.ui.stationsHud.update();
    }

    clearStationSelection() {
        this._selectedStations.forEach(s => {
            const instance = this._instantiatedStations.find(x => x.stationInfo == s);
            if (!instance) throw `Invalid isntance station id ${s.station_id}`;
            instance.colorLocked = false;
            instance.color = StationColors.IDLE;
        });
        this._selectedStations = [];
    }

    selectAllStations() {
        this._selectedStations = [];
        this._stationList?.forEach(s => {
            const instance = this._instantiatedStations.find(x => x.stationInfo == s);
            if (!instance) throw `Invalid isntance station id ${s.station_id}`;

            this._selectedStations.push(s);

            instance.color = StationColors.SELECTED;
            instance.colorLocked = true;
        });
    }

    get name() {
        return this._name;
    }

    get config() {
        return this._config;
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

    get selectedStations() {
        return this._selectedStations;
    }

    get asSerializable() {
        return <ISessionSave> {
            name: this._name,
            creation_date: this._creationDate,
            start_date: this._startDate,
            end_date: this._endDate,
            config: this.config,

            station_list: this._stationList
        };
    }

    static constructFromSave(save: ISessionSave) {
        const session = new ISMRSession(save.start_date, save.end_date, save.name, save.creation_date);
        session._config = save.config;
        session.stations = save.station_list;
        return session;
    }

}