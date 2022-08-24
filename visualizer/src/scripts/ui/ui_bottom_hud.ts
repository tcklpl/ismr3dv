import { IUI } from "./i_ui";

export class UIBottomHud implements IUI {

    private _currentDate = $('#bottom-hud-current-date');

    registerEvents(): void {
    }

    set currentDateLabel(s: string) {
        this._currentDate.html(s);
    }
    
}