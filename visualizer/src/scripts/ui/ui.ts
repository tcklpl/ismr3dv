import { UIConfig } from "./ui_config";
import { UIInfo } from "./ui_info";
import { UILoader } from "./ui_loader";
import { UITimeline } from "./ui_timeline";

export class UI {
    
    private _config = new UIConfig();
    private _info = new UIInfo();
    private _loader = new UILoader();
    private _timeline = new UITimeline();

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

}