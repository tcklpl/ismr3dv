
export class TimelineState {

    static SELECTING_TIME_INTERVAL = new TimelineState(false, true, false, false, false);
    static FETCHING_API = new TimelineState(true, false, true, false, false);
    static FETCH_ERROR = new TimelineState(false, false, false, true, false);
    static STATION_LIST = new TimelineState(false, false, false, false, true);

    private _blocked: boolean;
    private _startMsgVisible: boolean;
    private _fetchMsgVisible: boolean;
    private _fetchErrorMsgVisible: boolean;
    private _stationListVisible: boolean;

    constructor(blocked: boolean, startMsgVisible: boolean, fetchMsgVisible: boolean, fetchErrorMsgVisible: boolean, stationListVisible: boolean) {
        this._blocked = blocked;
        this._startMsgVisible = startMsgVisible;
        this._fetchMsgVisible = fetchMsgVisible;
        this._fetchErrorMsgVisible = fetchErrorMsgVisible;
        this._stationListVisible = stationListVisible;
    }

    get blocked() {
        return this._blocked;
    }

    get startMsgVisible() {
        return this._startMsgVisible;
    }

    get fetchMsgVisible() {
        return this._fetchMsgVisible;
    }

    get fetchErrorMsgVisible() {
        return this._fetchErrorMsgVisible;
    }

    get stationListVisible() {
        return this._stationListVisible;
    }
}