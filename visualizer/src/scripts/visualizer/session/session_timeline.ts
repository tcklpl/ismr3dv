import { IIPPInfo } from "../api/formats/i_ipp_info";
import { Moment } from "./moments/moment";
import { MomentBufferingManager } from "./moments/moment_buffering_manager";

export class SessionTimeline {
    
    private _ippInfoList: IIPPInfo[] = [];
    private _ippByDate: Map<number, IIPPInfo[]> = new Map(); // number is Date#getTime() / 100000. Cannot use Date object for comparisions
    private _coveredStations: number[] = [];

    private _currentlySelectedStations: number[] = [];
    private _moments: Moment[] = [];
    private _momentBufferingManager: MomentBufferingManager;

    constructor(currentIndex?: number) {
        this._momentBufferingManager = new MomentBufferingManager(currentIndex);
    }

    clearMoments() {
        this._moments = [];
    }

    addMoment(m: Moment) {
        this._moments.push(m);
    }

    bufferAvailableMoments() {
        this._momentBufferingManager.replaceMoments(this._moments);
        visualizer.universeScene.ippSphere.currentTexture = this._momentBufferingManager.texture;
    }

    setActiveMoment(index: number) {
        if (index < 0 || index > this._moments.length) {
            console.warn(`Trying to set moment out of bounds: ${index} -> [0, ${this._moments.length}]`);
            return;
        }
        this._momentBufferingManager.setMomentByIndex(index);
        visualizer.events.dispatchEvent('moment-changed', index);
    }

    updateSelectedStations(selection: number[]) {
        // return false if any selected station is not covered, however this shouldn't happen
        if (selection.find(x => !this._coveredStations.includes(Math.floor(x)))) return false;

        // return true if the 'new' selection is equal to the current one
        if (this._currentlySelectedStations.every(x => selection.includes(Math.floor(x))) && selection.every(x => this._currentlySelectedStations.includes(Math.floor(x)))) return true;

        // selection is different...
        this._currentlySelectedStations = selection.map(x => Math.floor(x));
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

    get currentMomentIndex() {
        return this._momentBufferingManager.currentIndex;
    }

    get currentMoment() {
        return this._moments[this._momentBufferingManager.currentIndex];
    }

}