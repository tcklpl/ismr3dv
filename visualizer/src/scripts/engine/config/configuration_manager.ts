import { IGraphicalConfiguration } from "./graphical_configuration";

export class ConfigurationManager {

    private _graphical!: IGraphicalConfiguration;

    loadConfiguration() {
        const graphicalStorage = localStorage.getItem('ismr3d-graphical-configuration');

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
    }

    saveConfigurations() {
        localStorage.setItem('ismr3d-graphical-configuration', JSON.stringify(this._graphical));
    }

    get graphical() {
        return this._graphical;
    }

}