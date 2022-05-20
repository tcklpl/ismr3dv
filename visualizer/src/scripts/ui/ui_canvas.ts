import { Vec2 } from "../engine/data_formats/vec/vec2";
import { IStationInfo } from "../visualizer/api/formats/i_station_info";
import { IUI } from "./i_ui";

export class UICanvas implements IUI {

    private _stationInfoPopup = $('#station-info-popup');
    private _sipId = $('#sip-id');
    private _sipName = $('#sip-name');
    private _sipLatitude = $('#sip-latitude');
    private _sipLongitude = $('#sip-longitude');

    registerEvents() {

    }

    showStationInfoPopup(station: IStationInfo, ndcWhere: Vec2) {
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

    hideStationInfoPopup() {
        this._stationInfoPopup.fadeOut(50);
    }
}