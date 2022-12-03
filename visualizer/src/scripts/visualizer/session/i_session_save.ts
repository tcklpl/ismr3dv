import { ISerializedFilter } from "../../ui/data_fetcher/i_serialized_filter";
import { TimelineNormalizator, TimelineNormValue } from "../../ui/timeline/ui_timeline_config";
import { IStationInfo } from "../api/formats/i_station_info";
import { ICameraSerializableInfo } from "../camera/main_camera";
import { ISatellite } from "../data/satellites/i_satellite";
import { ISessionConfig } from "./i_session.config";

export interface ISessionSave {

    name: string;
    creation_date: Date;

    start_date: Date;
    end_date: Date;

    config: ISessionConfig;

    camera: ICameraSerializableInfo;

    station_list: IStationInfo[];
    selected_stations: number[];

    current_moment: number;
    ipp_opacity: number;
    moment_play_speed: number;

    filters: ISerializedFilter[];
    selected_satellite_categories: ISatellite[];
    ion_height: number;
    target_index_name: string;

    interpolator_name: string;
    interpolator_parameters: any[];
    interpolator_threads: number;

    colorer_name: string;
    colorer_min: number;
    colorer_max: number;
    colorer_budget_per_frame: number;

    precision_width: number;
    precision_height: number;

    timeline_normalizator: TimelineNormalizator;
    timeline_norm_value: TimelineNormValue;
}