import { Visualizer } from "../visualizer/visualizer";

export class UIConfig {

    private static _cfgBloom = $('#cfg-bloom');
    private static _cfgEarthTex = $('#ctf-earth-texsize');
    private static _cfgSunTex = $('#ctf-sun-texsize');

    static registerEvents() {
        const configManager = Visualizer.instance.configurationManager;
        const graphicalConfig = configManager.graphical;
        $('#cfg-graphical-btn').on('click', () => {
            this._cfgBloom.prop('checked', graphicalConfig.bloom);
            $('#ctf-earth-texsize option').removeAttr('selected').filter(`[value=${graphicalConfig.earth_texture_size}]`).prop('selected', true);
            $('#ctf-sun-texsize option').removeAttr('selected').filter(`[value=${graphicalConfig.sun_texture_size}]`).prop('selected', true);
        });

        $('#cfg-btn-save').on('click', () => {
            graphicalConfig.bloom = this._cfgBloom.is(':checked');
            graphicalConfig.earth_texture_size = this._cfgEarthTex.val() as string;
            graphicalConfig.sun_texture_size = this._cfgSunTex.val() as string;
            configManager.saveConfigurations();
        });
    }



}