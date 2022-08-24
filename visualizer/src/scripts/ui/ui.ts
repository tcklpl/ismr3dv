import { UIBottomHud } from "./ui_bottom_hud";
import { UICanvas } from "./ui_canvas";
import { UIConfig } from "./ui_config";
import { UIFatal } from "./ui_fatal";
import { UIGizmos } from "./ui_gizmos";
import { UIInfo } from "./ui_info";
import { UILoader } from "./ui_loader";
import { UIOptionsHud } from "./ui_options_hud";
import { UIScreenshot } from "./ui_screenshot";
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
    private _gizmos = new UIGizmos();
    private _fatal = new UIFatal();
    private _screenshot = new UIScreenshot();
    private _bottomHud = new UIBottomHud();

    registerEssential() {
        this._config.registerEvents();
    }

    registerEvents() {

        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
        var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });

        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        this._timeline.registerEvents();
        this._session.registerEvents();
        this._optionsHud.registerEvents();
        this._canvas.registerEvents();
        this._stationsHud.registerEvents();
        this._gizmos.registerEvents();
        this._info.update();
        this._screenshot.registerEvents();
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

    get fatal() {
        return this._fatal;
    }

    get bottomHud() {
        return this._bottomHud;
    }

}