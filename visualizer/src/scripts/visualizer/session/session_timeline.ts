import { Vec2 } from "../../engine/data_formats/vec/vec2";
import { IIPPInfo } from "../api/formats/i_ipp_info";
import { Moment } from "./moment";
import { MomentBufferingManager } from "./moment_buffering_manager";
import { TimelineImageBuffers } from "./timeline_image_buffers";

export class SessionTimeline {
    
    private _ippInfoList: IIPPInfo[] = [];
    private _ippByDate: Map<number, IIPPInfo[]> = new Map(); // number is Date#getTime() / 100000. Cannot use Date object for comparisions
    private _coveredStations: number[] = [];

    private _currentlySelectedStations: number[] = [];
    private _moments: Moment[] = [];
    private _timelineImageBuffers = new TimelineImageBuffers(new Vec2(2048, 1024));
    private _momentBufferingManager = new MomentBufferingManager(this._timelineImageBuffers, 0.01);

    constructor() {        
    }

    private getTimeFromIPP(ipp: IIPPInfo) {
        // time_utc comes as "2014-09-01 22:00:00" (UTC)
        const regex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
        const matches = regex.exec(ipp.time_utc);
        if (!matches || matches.length < 7) {
            console.warn(`BAD IPP TIME UTC: ${ipp.time_utc}`);
            return -1;
        }
        return Date.UTC(parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3]), parseInt(matches[4]), parseInt(matches[5]), parseInt(matches[6]));
    }

    addIPP(list: IIPPInfo[]) {
        const filteredList = list.filter(x => !this._ippInfoList.includes(x));
        filteredList.forEach(ipp => {
            const date = this.getTimeFromIPP(ipp);
            let toInsert = this._ippByDate.get(Math.floor(date / 100000));
            if (!toInsert) {
                toInsert = [];
                this._ippByDate.set(Math.floor(date / 100000), toInsert);
            }
            toInsert.push(ipp);
            this._ippInfoList.push(ipp);
            if (!this._coveredStations.includes(ipp.id))
                this._coveredStations.push(ipp.id);
        });
    }

    isRangeCovered(start: Date, end: Date, stations: number[]) {
        const startTime = Math.floor(start.getTime() / 100000);
        const endTime = Math.floor(end.getTime() / 100000);

        for (let i = startTime; i <= endTime; i++) {
            const timeIPP = this._ippByDate.get(i);
            if (!timeIPP) {
                return false;
            }
        }

        if (stations.find(x => !this._coveredStations.includes(Math.floor(x)))) {
            return false;   
        }

        return true;
    }

    updateSelectedStations(selection: number[]) {
        // return false if any selected station is not covered, however this shouldn't happen
        if (selection.find(x => !this._coveredStations.includes(Math.floor(x)))) return false;

        // return true if the 'new' selection is equal to the current one
        if (this._currentlySelectedStations.every(x => selection.includes(Math.floor(x))) && selection.every(x => this._currentlySelectedStations.includes(Math.floor(x)))) return true;

        // selection is different...
        this._currentlySelectedStations = selection.map(x => Math.floor(x));
        this._moments = [];
        this._ippByDate.forEach((ippList, time) => {
            const filteredIPPList = ippList.filter(x => this._currentlySelectedStations.includes(Math.floor(x.id)));
            this._moments.push(new Moment(time, filteredIPPList));
        });
        this._momentBufferingManager.replaceMoments([...this._moments]);
        return true;
    }

    get coverage() {
        return [...this._ippByDate.keys()];
    }

    get currentMoments() {
        return this._moments;
    }

    get ippList() {
        return this._ippInfoList;
    }

    get buffer() {
        return this._momentBufferingManager;
    }

}