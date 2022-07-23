import { IMouseListener } from "./i_mouse_listener";

export class Mouse {

    private _x: number = -1;
    private _y: number = -1;
    
    private _listeners: IMouseListener[] = [];

    private _scrollStopTimer: number = -1;
    private _mouseStopTimer: number = -1;

    constructor() {
        this.registerEvents();
    }

    private registerEvents() {
        // Mouse move event
        gl.canvas.addEventListener('mousemove', e => {
            const rect = gl.canvas.getBoundingClientRect();
            this._x = e.clientX - rect.left;
            this._y = e.clientY - rect.top;
            
            this._listeners.forEach(l => {
                if (l.onMouseMove) l.onMouseMove(this._x, this._y);
                if (l.onMouseMoveOffset) l.onMouseMoveOffset(e.movementX, e.movementY);
            });

            if (this._mouseStopTimer != -1) clearTimeout(this._mouseStopTimer);
            this._mouseStopTimer = setTimeout(() => this.triggerMouseStop(), 50);
        });

        // Mouse click event
        gl.canvas.addEventListener('click', e => {
            this._listeners.forEach(l => {
                if (l.onMouseLeftClick) l.onMouseLeftClick();
            })
        });

        // Mouse scroll event
        gl.canvas.addEventListener('wheel', e => {
            this._listeners.forEach(l => {
                if (l.onMouseScroll) l.onMouseScroll(e.deltaY);
            });
            if (this._scrollStopTimer != -1) clearTimeout(this._scrollStopTimer);
            this._scrollStopTimer = setTimeout(() => this.triggerMouseScrollStop(), 300);
        });
    }

    private triggerMouseScrollStop() {
        this._scrollStopTimer = -1;
        this._listeners.forEach(l => {
            if (l.onMouseScrollStop) l.onMouseScrollStop();
        })
    }

    private triggerMouseStop() {
        this._mouseStopTimer = -1;
        this._listeners.forEach(l => {
            if (l.onMouseStop) l.onMouseStop();
        })
    }

    registerListener(l: IMouseListener) {
        this._listeners.push(l);
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

}