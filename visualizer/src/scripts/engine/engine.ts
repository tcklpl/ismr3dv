import { Visualizer } from "../visualizer/visualizer";
import { Renderer } from "./renderer/renderer";
import { Time } from "./time";
import { IFrameListener } from "./traits/i_frame_listener";

export class Engine {

    private _renderer = new Renderer();
    private _shouldRender = true;

    private _lastFrame: number = 0;
    private _lastSecond: number = 0;
    private _framesRendered: number = 0;
    private _config = Visualizer.instance.configurationManager;

    private _frameListeners: IFrameListener[] = [];
    
    render(time: number) {
        const msDiff = time - this._lastFrame;
        Time.deltaTime = msDiff / 1000;
        this._lastFrame = time;

        if (time - this._lastSecond >= 1000) {
            this._lastSecond = time;
            if (this._config.general.show_fps) Visualizer.instance.ui.info.setFPS(this._framesRendered);
            this._framesRendered = 0;
        }

        this._frameListeners.forEach(f => f.update());

        this._renderer.renderActive();
        this._framesRendered++;

        if (this._shouldRender) requestAnimationFrame(t => this.render(t));
    }

    adjustToWindowSize() {
        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;
        this._renderer.resize(gl.canvas.width, gl.canvas.height);
    }

    registerFrameListener(l: IFrameListener) {
        this._frameListeners.push(l);
    }

    haltExecution() {
        this._shouldRender = false;
    }

    get renderer() {
        return this._renderer;
    }

}