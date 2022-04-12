import { StationListCacheProvider } from "./station_list_cache_provider";

export class ISMRCacheHub {

    private _stations = new StationListCacheProvider();

    nuke() {
        this._stations.clear();
    }

    get stations() {
        return this._stations;
    }

}