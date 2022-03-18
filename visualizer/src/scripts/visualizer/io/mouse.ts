import { Visualizer } from "../visualizer";
import { IMouseListener } from "./i_mouse_listener";

export class Mouse {

    private _x: number = -1;
    private _y: number = -1;

    private _gl = Visualizer.instance.gl;
    private _listeners: IMouseListener[] = [];

    private _scrollStopTimer: number = -1;

    constructor() {
        this.registerEvents();
    }

    private registerEvents() {
        // Mouse move event
        this._gl.canvas.addEventListener('mousemove', e => {
            const rect = this._gl.canvas.getBoundingClientRect();
            this._x = e.clientX - rect.left;
            this._y = e.clientY - rect.top;
            this._listeners.forEach(l => {
                if (l.onMouseMove) l.onMouseMove(this._x, this._y);
            })
        });

        // Mouse click event
        this._gl.canvas.addEventListener('click', e => {
            this._listeners.forEach(l => {
                if (l.onMouseLeftClick) l.onMouseLeftClick();
            })
        });

        // Mouse scroll event
        this._gl.canvas.addEventListener('wheel', e => {
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

    registerListener(l: IMouseListener) {
        this._listeners.push(l);
    }

}