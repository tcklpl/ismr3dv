import { ISMRSession } from "../visualizer/session/ismr_session";
import { IUI } from "./i_ui";

export class UIBottomHud implements IUI {

    private _currentDate = $('#bottom-hud-current-date');

    private _divCurTime = $('#bottom-bud-cur-time');
    private _divCurStations = $('#station-count-div');

    registerEvents(): void {

        visualizer.events.on('moment-changed', (moment: number, ...rest) => {
            this.currentDateLabel = (visualizer.session as ISMRSession).timeline.currentMoments[moment].date.toLocaleString();
        });

        visualizer.events.on('session-is-present', (status: boolean, ...rest) => {
            this._divCurTime.toggleClass('d-inline-block', status).toggleClass('d-none', !status);
            this._divCurStations.toggleClass('d-inline-block', status).toggleClass('d-none', !status);
        });
    }

    set currentDateLabel(s: string) {
        this._currentDate.html(s);
    }
    
}