import { StationListProvider } from "./station_list_provider";

export class ISMRProviders {

    private _stations = new StationListProvider();

    get stations() {
        return this._stations;
    }

}