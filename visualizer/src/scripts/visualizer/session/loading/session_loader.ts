import { EngineError } from "../../../engine/errors/engine_error";
import { IIPPInfo } from "../../api/formats/i_ipp_info";
import { WorkerUtils } from "../../utils/worker_utils";
import { ISMRSession } from "../ismr_session";
import { ISessionSave } from "../i_session_save";
import { Moment } from "../moments/moment";
import { IMomentCalculatedInfo, ISessionLoadingThreadRequest, ISessionLoadingThreadResponse, sessionLoadingThread } from "./session_loading_thread";

export class SessionLoader {

    private _thread: Worker;
    private _sessionBeingLoaded?: ISMRSession;
    
    private _momentLength = 0;
    private _loadedMoments = 0;

    private _onSessionLoad?: () => void;

    constructor() {
        this._thread = WorkerUtils.createWorkerFromFunction(sessionLoadingThread);
        this._thread.onmessage = m => this.onMessage(m);
        this._thread.onerror = e => new EngineError('Session Loader', e.message);
    }

    loadSession(save: ISessionSave, onSessionLoad?: () => void) {

        this._onSessionLoad = onSessionLoad;
        this._momentLength = 0;
        this._loadedMoments = 0;
        const session = ISMRSession.constructFromSave(save);
        this._sessionBeingLoaded = session;

        // send the session name to the thread, this will trigger the ipp loading and moment construction
        this._thread.postMessage(<ISessionLoadingThreadRequest> {
            key: 'idbKey',
            idbKey: session.name
        });

        return session;
    }

    constructIPPForCurrentSession(ipp: IIPPInfo[], onFinish?: () => void) {
        if (!visualizer.session) throw new EngineError('Session Loader', 'Failed to load ipp for a null current session');
        this._onSessionLoad = onFinish;
        this._sessionBeingLoaded = visualizer.session;
        this._momentLength = 0;
        this._loadedMoments = 0;

        this._thread.postMessage(<ISessionLoadingThreadRequest> {
            key: 'rawIPP',
            rawIPP: ipp
        });
    }

    private onMessage(m: MessageEvent) {
        if (!this._sessionBeingLoaded) throw new EngineError('Session Loader', 'Received thread response without an active loading session');
        const res = m.data as ISessionLoadingThreadResponse;

        switch (res.key) {
            case 'count':
                this._momentLength = res.body as number;
                visualizer.events.dispatchEvent('session-loading-moment-size', res.body as number);
                break;
            case 'moment':
                this._loadedMoments++;
                visualizer.events.dispatchEvent('session-loading-moment-loaded', this._loadedMoments, this._momentLength);
                const moment = new Moment(res.body as IMomentCalculatedInfo);
                this._sessionBeingLoaded.timeline.addMoment(moment);

                // If the loading is over
                if (this._loadedMoments >= this._momentLength) {
                    visualizer.events.dispatchEvent('session-loading-complete');
                    if (this._onSessionLoad) this._onSessionLoad();
                    this._loadedMoments = 0;
                    this._momentLength = 0;
                    this._sessionBeingLoaded = undefined;
                }
                break;
                
        }
    }

}