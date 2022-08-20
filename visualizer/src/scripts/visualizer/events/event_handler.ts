import { RandomUtils } from "../utils/random_utils";
import { IEventListener } from "./i_event_listener";

export class EventHandler {

    private _listeners: Map<string, IEventListener[]> = new Map();

    registerListener(event: string, listener: (...args: any[]) => any) {
        const list = this._listeners.get(event) || [];
        const el = <IEventListener> {
            listener: listener,
            token: `eventtoken-${RandomUtils.randomString(25)}`
        };
        list.push(el);
        this._listeners.set(event, list);
        return el.token;
    }

    dispatchEvent(event: string, ...args: any[]) {
        const val = this._listeners.get(event);
        if (!val) return;
        val.forEach(v => v.listener(args));
    }

}