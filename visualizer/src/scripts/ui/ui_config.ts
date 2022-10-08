import { DisplayConfig } from "../config/configs/display";
import { GeneralConfig } from "../config/configs/general";
import { GraphicalConfig, TextureSize2k8k } from "../config/configs/graphical";
import { IUI } from "./i_ui";

export class UIConfig implements IUI {

    private _hasUnsupportedTextures: boolean = false;

    registerEvents() {
        const configManager = visualizer.configurationManager;
        
        $('[id^=cfg-graphical-btn-]').on('click', () => {
            this.loadCurrent();
        });

        $('#cfg-btn-save').on('click', () => {
            this.saveGeneral(configManager.general);
            this.saveDisplay(configManager.display);
            this.saveGraphical(configManager.graphical);
            configManager.saveConfigurations();
            visualizer.engine.renderer.compositor.updateSettings();
        });

        this.loadCurrent();

        $('#cfg-exposure').on('input', () => $('#cfg-exposure-label').html(`${$('#cfg-exposure').val()}`));
        $('#cfg-gamma').on('input', () => $('#cfg-gamma-label').html(`${$('#cfg-gamma').val()}`));
        $('#cfg-resolution-scale').on('input', () => $('#cfg-resolution-scale-label').html(`${(($('#cfg-resolution-scale').val() as number) * 100).toFixed(0)}%`));
    }

    loadCurrent() {
        const configManager = visualizer.configurationManager;
        this.setupGeneral(configManager.general);
        this.setupDisplay(configManager.display);
        this.setupGraphical(configManager.graphical);
    }

    private setupGeneral(generalConfig: GeneralConfig) {
        $('#cfg-fps').prop('checked', generalConfig.show_fps);
    }

    private saveGeneral(generalConfig: GeneralConfig) {
        generalConfig.show_fps = $('#cfg-fps').is(':checked');
        visualizer.ui.info.update();
    }

    private setupDisplay(displayConfig: DisplayConfig) {
        $('#cfg-exposure').val(displayConfig.exposure);
        $('#cfg-gamma').val(displayConfig.gamma);
        $('#cfg-exposure-label').html(`${displayConfig.exposure}`);
        $('#cfg-gamma-label').html(`${displayConfig.gamma}`);
    }

    private saveDisplay(displayConfig: DisplayConfig) {
        displayConfig.exposure = $('#cfg-exposure').val() as number;
        displayConfig.gamma = $('#cfg-gamma').val() as number;
    }

    private setupGraphical(graphicalConfig: GraphicalConfig) {
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

        $('#cfg-resolution-scale').val(graphicalConfig.resolution_scale);
        $('#cfg-resolution-scale-label').html(`${(graphicalConfig.resolution_scale * 100).toFixed(0)}%`);
    }

    private saveGraphical(graphicalConfig: GraphicalConfig) {
        graphicalConfig.bloom = $('#cfg-bloom').is(':checked');
        graphicalConfig.earth_texture_size = $('#ctf-earth-texsize').val() as TextureSize2k8k;
        graphicalConfig.sun_texture_size = $('#ctf-sun-texsize').val() as TextureSize2k8k;
        graphicalConfig.resolution_scale = $('#cfg-resolution-scale').val() as number;
        visualizer.engine.adjustToWindowSize();
    }

    private checkForTextureSizeSupport(elementValue: string) {
        const bigger = parseInt(elementValue.replace(/[^0-9]/gi, "")) * 1024 > visualizer.limitations.maxTextureSize;
        if (bigger) {
            this._hasUnsupportedTextures = true;
        }
        return bigger;
    }

    private disableUnsupportedTextureSizes(e: JQuery<HTMLElement>) {
        e.filter((index, value) => {
            return this.checkForTextureSizeSupport($(value).val() as string);
        }).attr('disabled', "").css('color', 'red');
    }
    
}