import { Vec2 } from "../../../engine/data_formats/vec/vec2";
import { InterpolatingFunctions } from "./interpolation/interpolating_functions";
import { MIStates, MomentInterpolator } from "./interpolation/interpolator";
import { IMomentInterpEntry } from "./interpolation/i_moment_queue_entries";

export class InterpolatorManager {

    private _numberOfInterpolators = 4;
    private _interpolators: MomentInterpolator[] = [];
    private _interpolatingFunction: InterpolatingFunctions = InterpolatingFunctions.DEFAULT;
    private _interpolatingParameters: any[] = InterpolatingFunctions.DEFAULT.options.map(opt => opt.default);

    private _onMsg: (m: MessageEvent) => void;
    private _onErr: (m: ErrorEvent) => void;
    private _onStt: (m: MIStates) => void;

    private _state: MIStates = 'idle';

    constructor(onMsg: (m: MessageEvent) => void, onErr: (m: ErrorEvent) => void, onStt: (m: MIStates) => void) {
        this._onMsg = onMsg;
        this._onErr = onErr;
        this._onStt = onStt;
    }

    killAll() {
        this._interpolators.forEach(i => i.terminate());
        this._interpolators = [];
    }

    setup(bufferSize: Vec2) {
        this.killAll();
        for (let i = 0; i < this._numberOfInterpolators; i++) {
            const interp = new MomentInterpolator(this._interpolatingFunction.func, bufferSize, ...this._interpolatingParameters);
            interp.onMessage = m => this._onMsg(m);
            interp.onError = e => this._onErr(e);
            interp.onStateChange(s => this.onInterpolatorStateChange(s));
            this._interpolators.push(interp);
        }
    }

    replaceInterpolatorOptions(fun: InterpolatingFunctions, params: any[], bufferSize: Vec2) {
        this._interpolatingFunction = fun;
        this._interpolatingParameters = params;
        this.setup(bufferSize);
    }

    distributeInterpolationJob(data: IMomentInterpEntry[]) {
        data.forEach((d, i) => {
            this._interpolators[i % this._numberOfInterpolators].queueDataForInterpolation(d);
        });
    }

    private onInterpolatorStateChange(state: MIStates) {
        if (state != this._state && !this._interpolators.find(x => x.getStatus() != state)) {
            this._state = state;
            this._onStt(state);
        }
    }

    get function() {
        return this._interpolatingFunction;
    }

    get parameters() {
        return this._interpolatingParameters;
    }

    get state() {
        return this._state;
    }

}