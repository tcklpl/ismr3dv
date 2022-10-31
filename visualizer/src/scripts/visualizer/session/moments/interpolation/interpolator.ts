import { Vec2 } from "../../../../engine/data_formats/vec/vec2";
import { WorkerUtils } from "../../../utils/worker_utils";
import { IMomentInterpEntry } from "./i_moment_queue_entries";

export type MIStates = 'idle' | 'finished' | 'working' | 'error' | 'terminated';

export class MomentInterpolator {

    private _worker: Worker;
    private _status: MIStates = 'idle';
    private _workLoad = 0;

    onMessage?: (m: MessageEvent) => void;
    onError?: (e: ErrorEvent) => void;

    private _stateChangeListeners: ((s: MIStates) => void)[] = [];

    constructor(interpFuncThread: (...args: any[]) => void, bufferSize: Vec2, ...extraParameters: any[]) {
        this._worker = WorkerUtils.createWorkerFromFunction(interpFuncThread, bufferSize.x, bufferSize.y, ...extraParameters);
        this._worker.onmessage = m => {
            this._workLoad--;
            if (this._workLoad <= 0) {
                this.state = 'finished';
            }
            if (this.onMessage) this.onMessage(m);
        };
        this._worker.onerror = m => {
            this.state = 'error';
            if (this.onError) this.onError(m);
        };
    }

    terminate() {
        this.state = 'terminated';
        this._worker.terminate();
    }

    interpolateData(data: IMomentInterpEntry[]) {
        this.state = 'working';
        this._workLoad += data.length;
        data.forEach(d => this._worker.postMessage(d));
    }

    private set state(s: MIStates) {
        this._status = s;
        this._stateChangeListeners.forEach(l => l(s));
        // The 'finished' state is just for triggering some functions, it will return to idle
        if (s == 'finished') {
            this.state = 'idle';
        }
    }

    getStatus() {
        return this._status;
    }

    onStateChange(l: (s: MIStates) => void) {
        this._stateChangeListeners.push(l);
    }

}