import { StorageController } from "../../local_storage/storage_controller";
import { StorageType } from "../../local_storage/storage_type";
import { Visualizer } from "../../visualizer/visualizer";
import { IGeneralConfiguration } from "./general_configuration";
import { IGraphicalConfiguration } from "./graphical_configuration";

export class ConfigurationManager {

    private _storage!: StorageController;

    private _graphical!: IGraphicalConfiguration;
    private _general!: IGeneralConfiguration;

    private _keyGraphical = 'graphical-configuration';
    private _keyGeneral = 'general-configuration';

    loadConfiguration() {
        this._storage = Visualizer.instance.storageController;

        const graphicalStorage = this._storage.get(StorageType.CONFIG, this._keyGraphical);
        const generalStorage = this._storage.get(StorageType.CONFIG, this._keyGeneral);

        try {
            if (!graphicalStorage) throw `No graphical storage`;
            this._graphical = JSON.parse(graphicalStorage) as IGraphicalConfiguration;
        } catch (e) {
            this._graphical = {
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
    }

    saveConfigurations() {
        this._storage.set(StorageType.CONFIG, this._keyGraphical, JSON.stringify(this._graphical));
        this._storage.set(StorageType.CONFIG, this._keyGeneral, JSON.stringify(this._general));
    }

    get graphical() {
        return this._graphical;
    }

    get general() {
        return this._general;
    }

}