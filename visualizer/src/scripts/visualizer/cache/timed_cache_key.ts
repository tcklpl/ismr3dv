import { IStorageKey } from "./i_storage_key";

export class TimedCacheKey implements IStorageKey {

    private _startDate: Date;
    private _endDate: Date;

    constructor(startDate: Date, endDate: Date) {
        this._startDate = startDate;
        this._endDate = endDate;
    }

    comprehendsDate(date: Date) {
        return this._startDate.getTime() <= date.getTime() && date.getTime() <= this._endDate.getTime();
    }

    get keyedString() {
        return `${this._startDate.toISOString()}|${this._endDate.toISOString()}`;
    }

    get start() {
        return this._startDate;
    }

    get end() {
        return this._endDate;
    }

}