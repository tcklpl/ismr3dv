import { IStationInfo } from "../api/formats/i_station_info";
import { ISessionConfig } from "./i_session.config";

export interface ISessionSave {

    name: string;
    creation_date: Date;

    start_date: Date;
    end_date: Date;

    config: ISessionConfig;

    station_list: IStationInfo[];
}