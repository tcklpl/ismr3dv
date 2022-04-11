import { Request, Response } from "express"
import { IStationInfoRequest } from "../api_formats/i_station_info_request";
import { Config } from "../config";
import { ExampleData } from "../example_data";
import fetch from "node-fetch";

export default {

    async fetchStationList(request: Request, response: Response) {
        if (!Config.instance.hasApiKey) return response.status(200).json(ExampleData.instance.exampleStations);

        let requestInfo: IStationInfoRequest;
        let dateBeginStr: string;
        let dateEndStr: string;
        let dateBegin: Date;
        let dateEnd: Date;

        try {
            let { startdate, enddate } = request.params;

            dateBeginStr = startdate;
            dateEndStr = enddate;

            dateBegin = new Date(dateBeginStr);
            dateEnd = new Date(dateEndStr);

            dateBeginStr = dateBegin.toISOString().slice(0, 19).replace('T', '%20');
            dateEndStr = dateEnd.toISOString().slice(0, 19).replace('T', '%20');
        } catch (e) {
            return response.status(400).json();
        }

        fetch(`https://ismrquerytool.fct.unesp.br/is/ismrtool/calc-var/service_loadStationList.php?date_begin=${dateBeginStr}&date_end=${dateEndStr}&mode=json&key=${Config.instance.apiKey}`).then(res => {
            res.json().then(j => {
                return response.status(200).json(j);
            });
        })
        .catch(() => {
            return response.status(500).json();
        })
        
    },
}