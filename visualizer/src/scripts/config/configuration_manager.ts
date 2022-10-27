import { IDBConfigController } from "../indexeddb/controllers/idb_config_controller";
import { GraphicalConfig } from "./configs/graphical";
import { GeneralConfig } from "./configs/general";
import { DisplayConfig } from "./configs/display";

export class ConfigurationManager {

    private _controller!: IDBConfigController;

    private _graphical = new GraphicalConfig();
    private _general = new GeneralConfig();
    private _display = new DisplayConfig();

    onLoad?: () => void;

    async loadConfiguration() {
        visualizer.idb.onReady(async () => {
            if (!visualizer.idb.isAvailable) {
                console.warn('Failed to load config: IndexedDB is unavailable');
                return;
            };
    
            this._controller = visualizer.idb.configController;
    
            const graphical = await this._controller.getOne(this._graphical.key);
            if (graphical) this._graphical = graphical as GraphicalConfig;
    
            const general = await this._controller.getOne(this._general.key);
            if (general) this._general = general as GeneralConfig;
    
            const display = await this._controller.getOne(this._display.key);
            if (display) this._display = display as DisplayConfig;

            if (this.onLoad) this.onLoad();
        });
    }

    saveConfigurations() {
        visualizer.idb.onReady(() => {
            if (!visualizer.idb.isAvailable) {
                console.warn('Failed to save config: IndexedDB is unavailable');
                return;
            };
    
            this._controller.put(this._graphical);
            this._controller.put(this._general);
            this._controller.put(this._display);
        })
    }

    get graphical() {
        return this._graphical;
    }

    get general() {
        return this._general;
    }

    get display() {
        return this._display;
    }

}