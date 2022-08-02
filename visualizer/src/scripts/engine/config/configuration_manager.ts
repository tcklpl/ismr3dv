import { StorageController } from "../../local_storage/storage_controller";
import { StorageType } from "../../local_storage/storage_type";
import { IDisplayConfiguration } from "./display_configuration";
import { IGeneralConfiguration } from "./general_configuration";
import { IGraphicalConfiguration } from "./graphical_configuration";

export class ConfigurationManager {

    private _storage!: StorageController;

    private _graphical!: IGraphicalConfiguration;
    private _general!: IGeneralConfiguration;
    private _display!: IDisplayConfiguration;

    private _keyGraphical = 'graphical-configuration';
    private _keyGeneral = 'general-configuration';
    private _keyDisplay = 'display-configuration';

    loadConfiguration() {
        this._storage = visualizer.storageController;

        const graphicalStorage = this._storage.get(StorageType.CONFIG, this._keyGraphical);
        const generalStorage = this._storage.get(StorageType.CONFIG, this._keyGeneral);
        const displayStorage = this._storage.get(StorageType.CONFIG, this._keyDisplay);

        try {
            if (!graphicalStorage) throw `No graphical storage`;
            this._graphical = JSON.parse(graphicalStorage) as IGraphicalConfiguration;
        } catch (e) {
            this._graphical = {
                resolution_scale: 1,
                bloom: true,
                earth_texture_size: "2k",
                sun_texture_size: "2k"
            };
        }

        try {
            if (!generalStorage) throw `No graphical storage`;
            this._general = JSON.parse(generalStorage) as IGeneralConfiguration;
        } catch (e) {
            this._general = {
                show_fps: false
            };
        }

        try {
            if (!displayStorage) throw `No display storage`;
            this._display = JSON.parse(displayStorage) as IDisplayConfiguration;
        } catch (e) {
            this._display = {
                exposure: 1.0,
                gamma: 2.2
            };
        }
    }

    saveConfigurations() {
        this._storage.set(StorageType.CONFIG, this._keyGraphical, JSON.stringify(this._graphical));
        this._storage.set(StorageType.CONFIG, this._keyGeneral, JSON.stringify(this._general));
        this._storage.set(StorageType.CONFIG, this._keyDisplay, JSON.stringify(this._display));
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