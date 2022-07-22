import { Visualizer } from "../visualizer/visualizer";
import { Renderer } from "./renderer/renderer";
import { Time } from "./time";
import { IFrameListener } from "./traits/i_frame_listener";

export class Engine {

    private _renderer = new Renderer();
    private _shouldRender = true;

    private _lastFrame: number = 0;
    private _gl = Visualizer.instance.gl;
    private _config = Visualizer.instance.configurationManager;

    private _frameListeners: IFrameListener[] = [];
    
    render(time: number) {
        const msDiff = time - this._lastFrame;
        Time.deltaTime = msDiff / 1000;
        this._lastFrame = time;

        if (this._config.general.show_fps) {
            Visualizer.instance.ui.info.setFPS(1 / Time.deltaTime);
        }

        this._frameListeners.forEach(f => f.update());

        this._renderer.renderActive();

        if (this._shouldRender) requestAnimationFrame(t => this.render(t));
    }

    adjustToWindowSize() {
        this._gl.canvas.width = this._gl.canvas.clientWidth;
        this._gl.canvas.height = this._gl.canvas.clientHeight;
        this._renderer.resize(this._gl.canvas.width, this._gl.canvas.height);
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