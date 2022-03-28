import { Visualizer } from "../visualizer/visualizer";
import { ImplementationLimitations } from "./limitations";
import { Renderer } from "./renderer";
import { Time } from "./time";
import { IFrameListener } from "./traits/i_frame_listener";

export class Engine {

    private _renderer = new Renderer();

    private _lastFrame: number = 0;
    private _gl = Visualizer.instance.gl;
    private _limitations = new ImplementationLimitations();

    private _frameListeners: IFrameListener[] = [];
    
    render(time: number) {
        const msDiff = time - this._lastFrame;
        Time.deltaTime = msDiff / 1000;
        this._lastFrame = time;

        this._frameListeners.forEach(f => f.update());

        this._renderer.renderActive();

        requestAnimationFrame(t => this.render(t));
    }

    adjustToWindowSize() {
        this._gl.canvas.width = this._gl.canvas.clientWidth;
        this._gl.canvas.height = this._gl.canvas.clientHeight;
        this._renderer.resize(this._gl.canvas.width, this._gl.canvas.height);
    }

    registerFrameListener(l: IFrameListener) {
        this._frameListeners.push(l);
    }

    get renderer() {
        return this._renderer;
    }

    get limitations() {
        return this._limitations;
    }

}