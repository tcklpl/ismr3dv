import { ISerializedFilter } from "../../ui/data_fetcher/i_serialized_filter";
import { IIPPInfo } from "../api/formats/i_ipp_info";
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
    raw_ipp: IIPPInfo[];

    current_moment: number;
    ipp_opacity: number;
    moment_play_speed: number;

    filters: ISerializedFilter[];
    selected_satellite_categories: ISatellite[];
    ion_height: number;
    target_index_name: string;
}