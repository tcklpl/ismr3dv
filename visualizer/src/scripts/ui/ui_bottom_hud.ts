import { ISMRSession } from "../visualizer/session/ismr_session";
import { IUI } from "./i_ui";

export class UIBottomHud implements IUI {

    private _currentDate = $('#bottom-hud-current-date');

    registerEvents(): void {

        visualizer.events.on('moment-changed', (moment: number, ...rest) => {
            this.currentDateLabel = (visualizer.session as ISMRSession).timeline.currentMoments[moment].date.toLocaleString();
        })
    }

    set currentDateLabel(s: string) {
        this._currentDate.html(s);
    }
    
}