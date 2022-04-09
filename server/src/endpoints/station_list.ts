import { Request, Response } from "express"
import { IStationInfoRequest } from "../api_formats/i_station_info_request";
import { Config } from "../config";
import { ExampleData } from "../example_data";
import fetch from "node-fetch";

export default {

    async fetchStationList(request: Request, response: Response) {
        if (!Config.instance.hasApiKey) return response.status(200).json(ExampleData.instance.exampleStations);

        let requestInfo: IStationInfoRequest;
        let dateBegin: string;
        let dateEnd: string;

        try {
            requestInfo = request.body as IStationInfoRequest;

            requestInfo.date_begin = new Date(requestInfo.date_begin);
            requestInfo.date_end = new Date(requestInfo.date_end);

            dateBegin = requestInfo.date_begin.toISOString().slice(0, 19).replace('T', '%20');
            dateEnd = requestInfo.date_end.toISOString().slice(0, 19).replace('T', '%20');
        } catch (e) {
            return response.status(400).json();
        }

        fetch(`https://ismrquerytool.fct.unesp.br/is/ismrtool/calc-var/service_loadStationList.php?date_begin=${dateBegin}&date_end=${dateEnd}&mode=json&key=${Config.instance.apiKey}`).then(res => {
            res.json().then(j => {
                return response.status(200).json(j);
            });
        })
        .catch(() => {
            return response.status(500).json();
        })
        
    },
}