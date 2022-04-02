import { IGeneralConfiguration } from "./general_configuration";
import { IGraphicalConfiguration } from "./graphical_configuration";

export class ConfigurationManager {

    private _graphical!: IGraphicalConfiguration;
    private _general!: IGeneralConfiguration;

    loadConfiguration() {
        const graphicalStorage = localStorage.getItem('ismr3d-graphical-configuration');
        const generalStorage = localStorage.getItem('ismr3d-general-configuration');

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
        localStorage.setItem('ismr3d-graphical-configuration', JSON.stringify(this._graphical));
        localStorage.setItem('ismr3d-general-configuration', JSON.stringify(this._general));
    }

    get graphical() {
        return this._graphical;
    }

    get general() {
        return this._general;
    }

}