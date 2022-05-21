import { IStationInfo } from "./api_formats/i_station_info";
import * as fs from 'fs';
import { IIPPInfo } from "./api_formats/i_ipp_info";

export class ExampleData {

    private static _instance: ExampleData;

    private _exampleStations: IStationInfo[];
    private _exampleIPP: IIPPInfo[];

    constructor() {
        ExampleData._instance = this;
        this._exampleStations = JSON.parse(fs.readFileSync(`${__dirname}/example_data/stations.json`, 'utf8')) as IStationInfo[];
        this._exampleIPP = JSON.parse(fs.readFileSync(`${__dirname}/example_data/ipp.json`, 'utf8')) as IIPPInfo[];
    }

    get exampleStations() {
        return this._exampleStations;
    }

    get exampleIPP() {
        return this._exampleIPP;
    }

    static get instance() {
        return this._instance;
    }

}