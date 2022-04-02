import { IGeneralConfiguration } from "../engine/config/general_configuration";
import { IGraphicalConfiguration } from "../engine/config/graphical_configuration";
import { Visualizer } from "../visualizer/visualizer";
import { UIInfo } from "./ui_info";

export class UIConfig {

    private static _hasUnsupportedTextures: boolean = false;

    static registerEvents() {
        const configManager = Visualizer.instance.configurationManager;

        $('#cfg-graphical-btn').on('click', () => {
            this.setupGeneral(configManager.general);
            this.setupGraphical(configManager.graphical);
        });

        $('#cfg-btn-save').on('click', () => {
            this.saveGeneral(configManager.general);
            this.saveGraphical(configManager.graphical);
            configManager.saveConfigurations();
        });
    }

    private static setupGeneral(generalConfig: IGeneralConfiguration) {
        $('#cfg-fps').prop('checked', generalConfig.show_fps);
    }

    private static saveGeneral(generalConfig: IGeneralConfiguration) {
        generalConfig.show_fps = $('#cfg-fps').is(':checked');
        UIInfo.update();
    }

    private static setupGraphical(graphicalConfig: IGraphicalConfiguration) {
        const earthTsChildren = $('#ctf-earth-texsize option');
        const sunTsChildren = $('#ctf-sun-texsize option');
        this._hasUnsupportedTextures = false;

        $('#cfg-bloom').prop('checked', graphicalConfig.bloom);

        earthTsChildren.removeAttr('selected').filter(`[value=${graphicalConfig.earth_texture_size}]`).prop('selected', true);
        this.disableUnsupportedTextureSizes(earthTsChildren);

        sunTsChildren.removeAttr('selected').filter(`[value=${graphicalConfig.sun_texture_size}]`).prop('selected', true);
        this.disableUnsupportedTextureSizes(sunTsChildren);

        if (this._hasUnsupportedTextures) {
            $('#cfg-warn-textures').show();
        }
    }

    private static saveGraphical(graphicalConfig: IGraphicalConfiguration) {
        graphicalConfig.bloom = $('#cfg-bloom').is(':checked');
        graphicalConfig.earth_texture_size = $('#ctf-earth-texsize').val() as string;
        graphicalConfig.sun_texture_size = $('#ctf-sun-texsize').val() as string;
    }

    private static checkForTextureSizeSupport(elementValue: string) {
        const bigger = parseInt(elementValue.replace(/[^0-9]/gi, "")) * 1024 > Visualizer.instance.engine.limitations.maxTextureSize;
        if (bigger) {
            this._hasUnsupportedTextures = true;
        }
        return bigger;
    }

    private static disableUnsupportedTextureSizes(e: JQuery<HTMLElement>) {
        e.filter((index, value) => {
            return this.checkForTextureSizeSupport($(value).val() as string);
        }).attr('disabled', "").css('color', 'red');
    }
    
}