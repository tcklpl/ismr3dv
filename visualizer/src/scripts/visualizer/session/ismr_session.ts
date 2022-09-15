import { Vec3 } from "../../engine/data_formats/vec/vec3";
import { MUtils } from "../../engine/utils/math_utils";
import { CustomAlert } from "../../ui/custom_alert";
import { IIPPInfo } from "../api/formats/i_ipp_info";
import { IStationInfo } from "../api/formats/i_station_info";
import { MainCamera } from "../camera/main_camera";
import { StationEntity } from "../objects/station";
import { ISessionConfig } from "./i_session.config";
import { ISessionSave } from "./i_session_save";
import { SessionTimeline } from "./session_timeline";
import { StationColors } from "./station_colors";

export class ISMRSession {

    private _name: string;
    private _creationDate: Date;
    private _startDate: Date;
    private _endDate: Date;

    private _controller = visualizer.idb.sessionController;

    private _config: ISessionConfig = {
        save_on_browser: true,
        auto_save: true,
        auto_save_interval_minutes: 5
    };
    private _autoSaveTask: number = -1;

    private _objectManager = visualizer.objectManager;

    private _stationList?: IStationInfo[];
    private _instantiatedStations: StationEntity[] = [];
    private _selectedStations: IStationInfo[] = [];

    private _timeline: SessionTimeline;

    constructor(startDate: Date, endDate: Date, name?: string, creationDate?: Date, currentMoment?: number) {
        this._startDate = startDate;
        this._endDate = endDate;
        this._creationDate = creationDate ?? new Date();
        this._name = name && name.length > 0 ? name : `${this._creationDate?.toDateString()} - ${startDate.toDateString()} to ${endDate.toDateString()}`;

        this._timeline = new SessionTimeline(currentMoment);
    }

    instantiateStationsAs3dObjects() {
        if (!this._stationList) {
            console.warn('failed to instantiate empty station list');
            return;
        }

        this._stationList.forEach(s => {
            const instance = this._objectManager.summon("monitoring_station", StationEntity);
            instance.stationInfo = s;
            instance.pickable = true;

            const pos = MUtils.latLongToUnitSphere(s.lat_, s.long_);
            instance.setPosition(pos);
            instance.setScale(Vec3.fromValue(0.3));
            instance.lookAt(Vec3.add(pos, pos));

            this._instantiatedStations.push(instance);
        });

        visualizer.universeScene.stations = this._instantiatedStations;
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

    notifyStationClick(station: StationEntity) {
        if (this._selectedStations.includes(station.stationInfo)) {
            this._selectedStations = this._selectedStations.filter(x => x != station.stationInfo);
            station.colorLocked = false;
            station.color = StationColors.IDLE;
        } else {
            this._selectedStations.push(station.stationInfo);
            station.color = StationColors.SELECTED;
            station.colorLocked = true;
        }
        visualizer.ui.stationsHud.update();
        visualizer.ui.timeline.updateForSelectedStations();
        visualizer.events.dispatchEvent('station-selection-update');
    }

    toggleStationById(id: number) {
        const station = this._instantiatedStations.find(x => x.stationInfo.station_id == id);
        if (!station) {
            console.warn(`Could not find station '${id}'`);
            return;
        };
        this.notifyStationClick(station);
    }

    clearStationSelection() {
        this._selectedStations.forEach(s => {
            const instance = this._instantiatedStations.find(x => x.stationInfo == s);
            if (!instance) throw `Invalid isntance station id ${s.station_id}`;
            instance.colorLocked = false;
            instance.color = StationColors.IDLE;
        });
        this._selectedStations = [];
        visualizer.ui.timeline.updateForSelectedStations();
        visualizer.events.dispatchEvent('station-selection-update');
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
        visualizer.ui.timeline.updateForSelectedStations();
        visualizer.events.dispatchEvent('station-selection-update');
    }

    addIPP(ipp: IIPPInfo[]) {
        this._timeline.addIPP(ipp);
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
            camera: visualizer.cameraManager.activeCamera?.asSerializable,

            station_list: this._stationList,
            selected_stations: this._selectedStations.map(x => x.station_id),
            raw_ipp: this._timeline.ippList || [],

            current_moment: this.timeline.buffer.currentIndex,
            ipp_opacity: visualizer.universeScene.ippSphere.opacity,
            moment_play_speed: visualizer.ui.timeline.speed
        };
    }

    get timeline() {
        return this._timeline;
    }

    static constructFromSave(save: ISessionSave) {
        const session = new ISMRSession(save.start_date, save.end_date, save.name, save.creation_date, save.current_moment);
        session._config = save.config;
        session.stations = save.station_list;
        if (save.camera.type == "main") {
            (visualizer.cameraManager.activeCamera as MainCamera).setData(save.camera);
        }
        session.addIPP(save.raw_ipp);
        save.selected_stations.forEach(s => session.toggleStationById(s));

        return session;
    }

}