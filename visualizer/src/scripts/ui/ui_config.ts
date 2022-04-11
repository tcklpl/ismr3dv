import { IGeneralConfiguration } from "../engine/config/general_configuration";
import { IGraphicalConfiguration } from "../engine/config/graphical_configuration";
import { StorageType } from "../local_storage/storage_type";
import { SizeNameUtils } from "../visualizer/utils/size_name_utils";
import { Visualizer } from "../visualizer/visualizer";

export class UIConfig {

    private _hasUnsupportedTextures: boolean = false;

    registerEvents() {
        const configManager = Visualizer.instance.configurationManager;

        $('#cfg-graphical-btn').on('click', () => {
            this.setupGeneral(configManager.general);
            this.setupGraphical(configManager.graphical);
            this.setupStorage();
        });

        $('#cfg-btn-save').on('click', () => {
            this.saveGeneral(configManager.general);
            this.saveGraphical(configManager.graphical);
            configManager.saveConfigurations();
        });
    }

    private setupGeneral(generalConfig: IGeneralConfiguration) {
        $('#cfg-fps').prop('checked', generalConfig.show_fps);
    }

    private saveGeneral(generalConfig: IGeneralConfiguration) {
        generalConfig.show_fps = $('#cfg-fps').is(':checked');
        Visualizer.instance.ui.info.update();
    }

    private setupGraphical(graphicalConfig: IGraphicalConfiguration) {
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

    private saveGraphical(graphicalConfig: IGraphicalConfiguration) {
        graphicalConfig.bloom = $('#cfg-bloom').is(':checked');
        graphicalConfig.earth_texture_size = $('#ctf-earth-texsize').val() as string;
        graphicalConfig.sun_texture_size = $('#ctf-sun-texsize').val() as string;
    }

    private setupStorage() {
        const storage = Visualizer.instance.storageController;

        const totalSize = storage.maxSizeKb * 1000;

        const configSize = storage.storagePerCategory.get(StorageType.CONFIG) ?? 0;
        const cacheSize = storage.storagePerCategory.get(StorageType.CACHE) ?? 0;

        $('#cfg-storage-info-total-space').html(`Total: ${SizeNameUtils.getNameBySize(totalSize, ['B', 'KB', 'MB'], 1000)}`);
        $('#cfg-storage-info-used-space').html(`In use: ${SizeNameUtils.getNameBySize(storage.totalUsedSizeBytes, ['B', 'KB', 'MB'], 1000)}`);

        $('#cfg-storage-info-config-size').html(`${SizeNameUtils.getNameBySize(configSize, ['B', 'KB', 'MB'], 1000)}`);
        $('#cfg-storage-info-cache-size').html(`${SizeNameUtils.getNameBySize(cacheSize, ['B', 'KB', 'MB'], 1000)}`);
        $('#cfg-storage-info-free-size').html(`${SizeNameUtils.getNameBySize(storage.totalFreeSpaceBytes, ['B', 'KB', 'MB'], 1000)}`);

        let usedProgressBar = 0;
        const minumumPercentage = 0.005;
        let configPercentage = configSize / totalSize;
        configPercentage = configPercentage > 0 ? Math.max(configPercentage, minumumPercentage) : 0;
        usedProgressBar += configPercentage;

        let cachePercentage = cacheSize / totalSize;
        cachePercentage = cachePercentage > 0 ? Math.min(Math.max(cachePercentage, minumumPercentage), 100 - usedProgressBar) : 0;
        usedProgressBar += cachePercentage;

        $('#cfg-storage-pb-config').css('width', `${configPercentage * 100}%`);
        $('#cfg-storage-pb-cache').css('width', `${cachePercentage * 100}%`);

        $('#btn-clear-storage-cache').prop('disabled', cacheSize <= 0 ? 'disabled': '');
        $('#btn-clear-storage-cache').on('click', () => {
            storage.removeCategory(StorageType.CACHE);
            this.setupStorage();
        });
    }

    private checkForTextureSizeSupport(elementValue: string) {
        const bigger = parseInt(elementValue.replace(/[^0-9]/gi, "")) * 1024 > Visualizer.instance.engine.limitations.maxTextureSize;
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