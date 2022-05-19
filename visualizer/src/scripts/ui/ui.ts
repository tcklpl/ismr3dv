import { UICanvas } from "./ui_canvas";
import { UIConfig } from "./ui_config";
import { UIInfo } from "./ui_info";
import { UILoader } from "./ui_loader";
import { UIOptionsHud } from "./ui_options_hud";
import { UISession } from "./ui_session";
import { UIStationsHud } from "./ui_stations_hud";
import { UITimeline } from "./ui_timeline";

export class UI {
    
    private _config = new UIConfig();
    private _info = new UIInfo();
    private _loader = new UILoader();
    private _timeline = new UITimeline();
    private _session = new UISession();
    private _optionsHud = new UIOptionsHud();
    private _canvas = new UICanvas();
    private _stationsHud = new UIStationsHud();

    registerEvents() {

        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
        var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });

        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        this._config.registerEvents();
        this._timeline.registerEvents();
        this._session.registerEvents();
        this._optionsHud.registerEvents();
        this._canvas.registerEvents();
        this._stationsHud.registerEvents();
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

    get stationsHud() {
        return this._stationsHud;
    }

}