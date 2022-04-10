import { IGeneralConfiguration } from "../engine/config/general_configuration";
import { IGraphicalConfiguration } from "../engine/config/graphical_configuration";
import { StorageType } from "../local_storage/storage_type";
import { SizeNameUtils } from "../visualizer/utils/size_name_utils";
import { Visualizer } from "../visualizer/visualizer";
import { UIInfo } from "./ui_info";

export class UIConfig {

    private static _hasUnsupportedTextures: boolean = false;

    static registerEvents() {
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

    private static setupStorage() {
        const storage = Visualizer.instance.storageController;

        const totalSize = storage.maxSizeKb * 1000;

        const configSize = storage.storagePerCategory.get(StorageType.CONFIG) ?? 0;
        const cacheSize = storage.storagePerCategory.get(StorageType.CACHE) ?? 0;

        $('#cfg-storage-info-total-space').html(`Total: ${SizeNameUtils.getNameBySize(totalSize, ['B', 'KB', 'MB'], 1000)}`);
        $('#cfg-storage-info-used-space').html(`In use: ${SizeNameUtils.getNameBySize(storage.totalUsedSizeBytes, ['B', 'KB', 'MB'], 1000)}`);

        $('#cfg-storage-info-config-size').html(`${SizeNameUtils.getNameBySize(configSize, ['B', 'KB', 'MB'], 1000)}`);
        $('#cfg-storage-info-cache-size').html(`${SizeNameUtils.getNameBySize(cacheSize, ['B', 'KB', 'MB'], 1000)}`);
        $('#cfg-storage-info-free-size').html(`${SizeNameUtils.getNameBySize(storage.totalFreeSpaceBytes, ['B', 'KB', 'MB'], 1000)}`);

        $('#cfg-storage-pb-config').css('width', `${configSize / totalSize * 100}%`);
        $('#cfg-storage-pb-cache').css('width', `${cacheSize / totalSize * 100}%`);

        $('#btn-clear-storage-cache').prop('disabled', cacheSize <= 0 ? 'disabled': '');
        $('#btn-clear-storage-cache').on('click', () => {
            storage.removeCategory(StorageType.CACHE);
            this.setupStorage();
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