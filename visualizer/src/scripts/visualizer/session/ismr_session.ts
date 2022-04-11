import { IStationInfo } from "../api/formats/i_station_info";

export class ISMRSession {

    private _startDate: Date;
    private _endDate: Date;

    private _stationList?: IStationInfo[];

    constructor(startDate: Date, endDate: Date) {
        this._startDate = startDate;
        this._endDate = endDate;
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
    }

}