import { Vec3 } from "../../engine/data_formats/vec/vec3";
import { MUtils } from "../../engine/utils/math_utils";
import { CustomAlert } from "../../ui/custom_alert";
import { IStationInfo } from "../api/formats/i_station_info";
import { MainCamera } from "../camera/main_camera";
import { SatelliteEntity } from "../objects/satellite";
import { StationEntity } from "../objects/station";
import { ISessionConfig } from "./i_session.config";
import { ISessionSave } from "./i_session_save";
import { ColorPrograms } from "./moments/colorers/color_programs/color_programs";
import { InterpolatingFunctions } from "./moments/interpolation/interpolating_functions";
import { SessionTimeline } from "./session_timeline";
import { StationColors } from "./station_colors";

export class ISMRSession {

    private _name: string;
    private _creationDate: Date;
    private _startDate: Date;
    private _endDate: Date;

    private _controller = visualizer.idb.sessionController;
    private _ippController = visualizer.idb.sessionIPPController;

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

    private _instantiatedSatellites: SatelliteEntity[] = [];

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

    instantiateSatellitesAs3dObjects() {
        
        const satelliteNameList: string[] = [];
        this._timeline.currentMoments.forEach(s => {
            [...s.satellitesCoords.keys()].forEach(k => {
                if (!satelliteNameList.includes(k)) satelliteNameList.push(k);
            });
        });

        satelliteNameList.forEach(sn => {

            if (this._timeline.currentMoments[0].satellitesCoords.has(sn)) {
                const instance = this._objectManager.summon("satellite", SatelliteEntity);
                instance.pickable = true;
                instance.curInfo.name = sn;

                const pos = this._timeline.currentMoments[0].satellitesCoords.get(sn) as Vec3;
                pos.multiplyByFactor(1.2);
                instance.setPosition(pos);
                instance.setScale(Vec3.fromValue(0.01));
                instance.lookAt(Vec3.add(pos, pos));

                this._instantiatedSatellites.push(instance);
            }
            
        });

        visualizer.universeScene.stations = this._instantiatedStations;
        visualizer.universeScene.satellites = this._instantiatedSatellites;
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
            this.autoSave();
        }

        this._controller.put(this.asSerializable)
        .then(() => {
            this._ippController.put({
                name: this._name,
                raw_ipp: this.timeline.currentMoments.flatMap(m => m.data)
            })
            .then(() => {
                new CustomAlert('success', 'Session saved!', 1);
            })
            .catch(() => {
                new CustomAlert('danger', 'Failed to save the session', 5);
            });    
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
            if (!instance) throw `Invalid instance station id ${s.station_id}`;

            this._selectedStations.push(s);

            instance.color = StationColors.SELECTED;
            instance.colorLocked = true;
        });
        visualizer.ui.timeline.updateForSelectedStations();
        visualizer.events.dispatchEvent('station-selection-update');
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

            current_moment: this.timeline.buffer.currentIndex,
            ipp_opacity: visualizer.universeScene.ippSphere.opacity,
            moment_play_speed: visualizer.ui.timeline.speed,

            filters: visualizer.ui.dataFetcher.filterManager.serializedFilters,
            selected_satellite_categories: visualizer.ui.dataFetcher.satTypeManager.selection,
            ion_height: visualizer.ui.dataFetcher.ionHeight,

            interpolator_threads: this.timeline.buffer.interpolator.threadCount,
            interpolator_name: this.timeline.buffer.interpolator.function.name,
            interpolator_parameters: this.timeline.buffer.interpolator.parameters,

            colorer_name: this.timeline.buffer.colorer.selectedProgram.name,
            colorer_min: this.timeline.buffer.colorer.bounds.x,
            colorer_max: this.timeline.buffer.colorer.bounds.y,
            colorer_budget_per_frame: this.timeline.buffer.colorer.budgetPerFrame,

            precision_width: this.timeline.buffer.bufferSize.x,
            precision_height: this.timeline.buffer.bufferSize.y
        };
    }

    get timeline() {
        return this._timeline;
    }

    static constructFromSave(save: ISessionSave) {

        const session = new ISMRSession(save.start_date, save.end_date, save.name, save.creation_date, save.current_moment);
        session._config = save.config;
        session.stations = save.station_list;

        const interp = InterpolatingFunctions.getByName(save.interpolator_name);
        if (interp) {
            session.timeline.buffer.interpolator.threadCount = save.interpolator_threads ?? 4;
            session.timeline.buffer.interpolator.replaceInterpolatorOptions(interp, save.interpolator_parameters ?? [], session.timeline.buffer.bufferSize);
        }

        const colorer = ColorPrograms.getByName(save.colorer_name);
        if (colorer) {
            const colorerManager = session.timeline.buffer.colorer;
            colorerManager.budgetPerFrame = save.colorer_budget_per_frame ?? 5;
            colorerManager.bounds.x = save.colorer_min ?? 0;
            colorerManager.bounds.y = save.colorer_max ?? 1;
            colorerManager.selectedProgram = colorer;
        }

        session.timeline.buffer.setResolution(save.precision_width ?? 360, save.precision_height ?? 180);

        save.selected_stations.forEach(s => session.toggleStationById(s));

        if (save.filters) visualizer.ui.dataFetcher.filterManager.constructFiltersFromSave(save.filters);
        if (save.selected_satellite_categories) {
            visualizer.ui.dataFetcher.satTypeManager.selection.push(...save.selected_satellite_categories)
            visualizer.ui.dataFetcher.satTypeManager.updateForExternallySetSelection();
        };
        if (save.ion_height) visualizer.ui.dataFetcher.ionHeight = save.ion_height;

        if (save.camera.type == "main") {
            (visualizer.cameraManager.activeCamera as MainCamera).setData(save.camera);
        }

        return session;

    }

}