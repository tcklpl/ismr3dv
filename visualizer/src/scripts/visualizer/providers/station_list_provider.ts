import { IStationInfo } from "../api/formats/i_station_info";
import { IntervalAvailability } from "../cache/interval_availability";
import { Visualizer } from "../visualizer";

export class StationListProvider {

    private _api = Visualizer.instance.api;
    private _cache = Visualizer.instance.cache.stations;

    requireOnInterval(start: Date, end: Date) {
        return new Promise<IStationInfo[]>((resolve, reject) => {

            const cacheFetch = this._cache.queryInterval(start, end);
            let fetchStart!: Date, fetchEnd!: Date;
            let ok = false;

            switch (cacheFetch.availability) {
                case IntervalAvailability.TOTAL:
                    ok = true;
                    resolve(cacheFetch.value as IStationInfo[]);
                    break;
                case IntervalAvailability.PARTIAL:
                    fetchStart = cacheFetch.uncoveredIntervalStart as Date;
                    fetchEnd = cacheFetch.uncoveredIntervalEnd as Date;
                    break;
                case IntervalAvailability.NONE:
                    fetchStart = start;
                    fetchEnd = end;
            }

            if (!ok) {
                this._api.fetchStations(fetchStart, fetchEnd)
                .then(ret => {
                    this._cache.register(fetchStart, fetchEnd, ret);
                    resolve(ret);
                })
                .catch(err => {
                    reject(err);
                });
            }
        });
    }

}