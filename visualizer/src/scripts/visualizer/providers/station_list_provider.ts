import { IStationInfo } from "../api/formats/i_station_info";

export class StationListProvider {

    private _api = visualizer.api;

    requireOnInterval(start: Date, end: Date) {
        return new Promise<IStationInfo[]>((resolve, reject) => {
            this._api.fetchStations(start, end)
            .then(ret => {
                resolve(ret);
            })
            .catch(err => {
                reject(err);
            });
        });
    }

}