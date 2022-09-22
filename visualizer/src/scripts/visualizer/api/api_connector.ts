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
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return new Promise<IIPPInfo[]>((resolve, reject) => {
            fetch(
                ISMRAPIEndpoints.IPP,
                {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        startdate: req.startDate.toISOString(),
                        enddate: req.endDate.toISOString(),
                        sat: req.satellites,
                        stations: req.stations.join(','),
                        ion: `${req.ion}`,
                        filter: req.filter,
                        field: req.field
                    })
                }
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