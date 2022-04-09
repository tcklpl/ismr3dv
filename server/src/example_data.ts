import { IStationInfo } from "./api_formats/i_station_info";
import * as fs from 'fs';

export class ExampleData {

    private static _instance: ExampleData;

    private _exampleStations: IStationInfo[];

    constructor() {
        ExampleData._instance = this;
        this._exampleStations = JSON.parse(fs.readFileSync(`${__dirname}/example_data/stations.json`, 'utf8')) as IStationInfo[];
    }

    get exampleStations() {
        return this._exampleStations;
    }

    static get instance() {
        return this._instance;
    }

}