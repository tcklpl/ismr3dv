
export class EngineError extends Error {

    private _threwBy: string;
    private _description: string;
    private _time: number;

    constructor(threwBy: string, description: string) {
        super();
        this._threwBy = threwBy;
        this._description = description;
        this._time = new Date().getTime();
    }

    get threwBy() {
        return this._threwBy;
    }

    get description() {
        return this._description;
    }

    get time() {
        return this._time;
    }

}