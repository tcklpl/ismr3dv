import { ISMRAPIEndpoints } from "./api_endpoints";
import { IIPPInfo } from "./formats/i_ipp_info";
import { IIPPRequest } from "./formats/i_ipp_request";
import { IServerInfo } from "./formats/i_server_info";
import { IServerInfoResponse } from "./formats/i_server_info_response";
import { IStationInfo } from "./formats/i_station_info";

export class ISMRAPIConnector {

    fetchStations(start: Date, end: Date) {
        return new Promise<IStationInfo[]>((resolve, reject) => {
            fetch(ISMRAPIEndpoints.STATION_LIST.replace(':startdate', start.toISOString()).replace(':enddate', end.toISOString()))
            .then(res => {
                if (res.ok) {
                    res.json()
                    .then(json => resolve(json))
                    .catch(err => reject(err));
                } else {
                    reject("Server error");
                }
            })
            .catch(err => reject(err));
        });
    }

    fetchIPP(req: IIPPRequest) {
        return new Promise<IIPPInfo[]>((resolve, reject) => {
            fetch(
                ISMRAPIEndpoints.IPP
                .replace(':startdate', req.startDate.toISOString())
                .replace(':enddate', req.endDate.toISOString())
                .replace(':sat', req.satellites)
                .replace(':stations', req.stations)
                .replace(':ion', `${req.ion}`)
            )
            .then(res => {
                if (res.ok) {
                    res.json()
                    .then(json => resolve(json))
                    .catch(err => reject(err));
                } else {
                    reject("Server error");
                }
            })
            .catch(err => reject(err));
        });
    }

    fetchServerInfo() {
        return new Promise<IServerInfo>((resolve, reject) => {
            fetch(ISMRAPIEndpoints.SERVER_INFO)
            .then(res => {
                if (res.ok) {
                    res.json()
                    .then(json => {
                        let response = json as IServerInfoResponse;
                        resolve({
                            showcase_mode: response.showcase_mode,
                            showcase_start_date: new Date(response.showcase_start_date),
                            showcase_end_date: new Date(response.showcase_end_date)
                        });
                    })
                    .catch(err => reject(err));
                } else {
                    reject("Server error");
                }
            })
            .catch(err => reject(err));
        });
    }

}