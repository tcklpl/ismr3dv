import { Vec2 } from "../engine/data_formats/vec/vec2";
import { IStationInfo } from "../visualizer/api/formats/i_station_info";
import { ISatInfo } from "../visualizer/objects/satellite";
import { IUI } from "./i_ui";

export class UICanvas implements IUI {

    private _stationInfoPopup = $('#station-info-popup');
    private _sipId = $('#sip-id');
    private _sipName = $('#sip-name');
    private _sipLatitude = $('#sip-latitude');
    private _sipLongitude = $('#sip-longitude');

    private _satInfoPopup = $('#satellite-info-popup');
    private _satName = $('#sat-name');
    private _satValue = $('#sat-val');

    private _hideSatelliteTimeout = -1;
    private _hideStationTimeout = -1;

    registerEvents() {

    }

    showStationInfoPopup(station: IStationInfo, ndcWhere: Vec2) {
        if (this._hideStationTimeout > -1) {
            clearTimeout(this._hideStationTimeout);
        }
        this._sipId.html(`#${station.station_id}`);
        this._sipName.html(station.name);
        this._sipLatitude.html(`${station.lat_}`);
        this._sipLongitude.html(`${station.long_}`);
        this._stationInfoPopup.fadeIn(50);
        
        const contentWidth = this._stationInfoPopup.width() as number;
        const contentHeight = this._stationInfoPopup.height() as number;

        const maxLeft = window.innerWidth - contentWidth - 50;
        const maxTop = window.innerHeight - contentHeight - 50;

        const x = (ndcWhere.x + 1) / 2;
        const y = 1 - (ndcWhere.y + 1) / 2;

        const left = Math.min(x * window.innerWidth, maxLeft);
        const top = Math.min(y * window.innerHeight, maxTop);

        this._stationInfoPopup.css('left', left).css('top', top);
    }

    showSatelliteInfoPopup(info: ISatInfo, ndcWhere: Vec2) {
        if (this._hideSatelliteTimeout > -1) {
            clearTimeout(this._hideSatelliteTimeout);
        }
        if (!info || !info.name || !info.value) return;
        this._satName.html(info.name);
        this._satValue.html(info.value.toFixed(5));
        this._satInfoPopup.fadeIn(50);
        
        const contentWidth = this._stationInfoPopup.width() as number;
        const contentHeight = this._stationInfoPopup.height() as number;

        const maxLeft = window.innerWidth - contentWidth - 50;
        const maxTop = window.innerHeight - contentHeight - 50;

        const x = (ndcWhere.x + 1) / 2;
        const y = 1 - (ndcWhere.y + 1) / 2;

        const left = Math.min(x * window.innerWidth, maxLeft);
        const top = Math.min(y * window.innerHeight, maxTop);

        this._satInfoPopup.css('left', left).css('top', top);
    }

    hideStationInfoPopup() {
        if (this._hideStationTimeout > -1) {
            clearTimeout(this._hideStationTimeout);
        }
        this._hideStationTimeout = setTimeout(() => {
            this._stationInfoPopup.fadeOut(50)
            this._hideStationTimeout = -1;
        }, 50);
    }

    hideSatelliteInfoPopup() {
        if (this._hideSatelliteTimeout > -1) {
            clearTimeout(this._hideSatelliteTimeout);
        }
        this._hideSatelliteTimeout = setTimeout(() => {
            this._satInfoPopup.fadeOut(50)
            this._hideSatelliteTimeout = -1;
        }, 50);
    }
}