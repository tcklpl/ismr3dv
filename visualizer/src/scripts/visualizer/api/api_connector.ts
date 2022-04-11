import { ISMRAPIEndpoints } from "./api_endpoints";
import { IStationInfo } from "./formats/i_station_info";
import { IStationInfoRequest } from "./formats/i_station_info_request";

export class ISMRAPIConnector {

    fetchStations(start: Date, end: Date) {
        return new Promise<IStationInfo[]>((resolve, reject) => {
            
            const request = <IStationInfoRequest>{
                start_date: start,
                end_date: end
            };

            fetch(ISMRAPIEndpoints.STATION_LIST.replace(':startdate', start.toISOString()).replace(':enddate', end.toISOString()))
            .then(res => {
                res.json()
                .then(json => resolve(json))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));

        });
    }

}