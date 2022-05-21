import { Request, Response } from "express";
import { Config } from "../config";
import { ExampleData } from "../example_data";
import { DateUtils } from "../utils/date_utils";
import fetch from "node-fetch";

export default {

    async fetchIPP(request: Request, response: Response) {
        if (!Config.instance.hasApiKey) return response.status(200).json(ExampleData.instance.exampleIPP);

        let dateBeginStr: string;
        let dateEndStr: string;
        let dateBegin: Date;
        let dateEnd: Date;
        let sattelites: string;
        let stationsToQuery: string;
        let ionDistance: string;

        try {
            let { startdate, enddate, sat, stations, ion } = request.params;

            dateBeginStr = startdate;
            dateEndStr = enddate;
            sattelites = sat;
            stationsToQuery = stations;
            ionDistance = ion;

            dateBegin = new Date(dateBeginStr);
            dateEnd = new Date(dateEndStr);

            dateBeginStr = DateUtils.formatToLocalISOLike(dateBegin);
            dateEndStr = DateUtils.formatToLocalISOLike(dateEnd);
        } catch (e) {
            return response.status(400).json();
        }

        let query = [
            'http://is-cigala-calibra.fct.unesp.br/is/ismrtool/map/service_getMapIppPoints.php',
            `?date_begin=${dateBeginStr}`,
            `&date_end=${dateEndStr}`,
            `&satellite=${sattelites}`,
            `&station=${stationsToQuery}`,
            `&ion=${ionDistance}`,
            `&field=s4`,
            `&mode=json`,
            `&aggregation=none`,
            `&filters=true`,
            `&key=${Config.instance.apiKey}`
        ];

        fetch(query.reduce((prev, cur) => prev + cur, '')).then(res => {
            res.json()
            .then(j => {
                return response.status(200).json(j);
            })
            .catch(err => {
                console.log(err);
                res.text().then(t => console.log(t));
                return response.status(500).json({"error": "API sent non-JSON data"});
            });
        })
        .catch(() => {
            return response.status(500).json();
        })
        
    },
}