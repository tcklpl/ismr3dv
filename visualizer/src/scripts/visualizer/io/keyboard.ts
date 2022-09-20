
export interface IKeyEventListener {
    type: 'static' | 'counted';
    on: 'down' | 'up';
    uses?: number;
    callback: () => void;
}

export class Keyboard {

    private _keyDownListeners: Map<string, IKeyEventListener[]> = new Map();
    private _keyUpListeners: Map<string, IKeyEventListener[]> = new Map();

    constructor() {
        $('#ismr3dcanvas').on('keydown', e => this.onKeyEvent(e, 'down'));
        $('#ismr3dcanvas').on('keyup', e => this.onKeyEvent(e, 'up'));
    }

    registerListener(key: string, listener: IKeyEventListener) {
        if (!this.validateListener(listener)) {
            console.error(`Trying to register invalid listener for key '${key}'`);
            return;
        }
        const listenerList = listener.on == 'down' ? this._keyDownListeners : this._keyUpListeners;
        const list = listenerList.get(key);
        if (!list) {
            listenerList.set(key, [listener])
        } else {
            list.push(listener);
        }
    }

    private validateListener(listener: IKeyEventListener) {
        if (listener.type == 'counted') {
            if (!listener.uses) return false;
        }
        return true;
    }

    private onKeyEvent(e: JQuery.KeyDownEvent | JQuery.KeyUpEvent, type: 'down' | 'up') {
        const key = e.key.toLowerCase();
        const toRemove: IKeyEventListener[] = [];
        const listeners = type == 'down' ? this._keyDownListeners : this._keyUpListeners;
        listeners.get(key)?.forEach(l => {
            l.callback();
            if (l.type == 'counted') {
                (l.uses as number)--;
                if (l.uses as number <= 0) {
                    toRemove.push(l);
                }
            }
        });
        if (toRemove.length > 0) {
            let list = listeners.get(key) as IKeyEventListener[];
            list = list.filter(x => !toRemove.some(y => x == y));
            listeners.set(key, list);
        }
    }

}