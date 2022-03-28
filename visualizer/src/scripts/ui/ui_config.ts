import { IGraphicalConfiguration } from "../engine/config/graphical_configuration";
import { Visualizer } from "../visualizer/visualizer";

export class UIConfig {

    private static _cfgBloom = $('#cfg-bloom');
    private static _cfgEarthTex = $('#ctf-earth-texsize');
    private static _cfgSunTex = $('#ctf-sun-texsize');

    private static _hasUnsupportedTextures: boolean = false;

    static registerEvents() {
        const configManager = Visualizer.instance.configurationManager;
        const graphicalConfig = configManager.graphical;

        const earthTsChildren = $('#ctf-earth-texsize option');
        const sunTsChildren = $('#ctf-sun-texsize option');

        $('#cfg-graphical-btn').on('click', () => {
            this._hasUnsupportedTextures = false;

            this._cfgBloom.prop('checked', graphicalConfig.bloom);

            earthTsChildren.removeAttr('selected').filter(`[value=${graphicalConfig.earth_texture_size}]`).prop('selected', true);
            this.disableUnsupportedTextureSizes(earthTsChildren);

            sunTsChildren.removeAttr('selected').filter(`[value=${graphicalConfig.sun_texture_size}]`).prop('selected', true);
            this.disableUnsupportedTextureSizes(sunTsChildren);

            if (this._hasUnsupportedTextures) {
                $('#cfg-warn-textures').show();
            }
        });

        $('#cfg-btn-save').on('click', () => {
            graphicalConfig.bloom = this._cfgBloom.is(':checked');
            graphicalConfig.earth_texture_size = this._cfgEarthTex.val() as string;
            graphicalConfig.sun_texture_size = this._cfgSunTex.val() as string;
            configManager.saveConfigurations();
        });
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