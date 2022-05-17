import { UICanvas } from "./ui_canvas";
import { UIConfig } from "./ui_config";
import { UIInfo } from "./ui_info";
import { UILoader } from "./ui_loader";
import { UIOptionsHud } from "./ui_options_hud";
import { UISession } from "./ui_session";
import { UITimeline } from "./ui_timeline";

export class UI {
    
    private _config = new UIConfig();
    private _info = new UIInfo();
    private _loader = new UILoader();
    private _timeline = new UITimeline();
    private _session = new UISession();
    private _optionsHud = new UIOptionsHud();
    private _canvas = new UICanvas();

    registerEvents() {
        this._config.registerEvents();
        this._timeline.registerEvents();
        this._session.registerEvents();
        this._optionsHud.registerEvents();
        this._canvas.registerEvents();
        this._info.update();
    }

    get config() {
        return this._config;
    }

    get info()  {
        return this._info;
    }

    get loader() {
        return this._loader;
    }

    get timeline() {
        return this._timeline;
    }

    get session() {
        return this._session;
    }

    get optionsHud() {
        return this._optionsHud;
    }

    get canvas() {
        return this._canvas;
    }

}