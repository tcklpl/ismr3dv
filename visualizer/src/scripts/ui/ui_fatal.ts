import { EngineError } from "../engine/errors/engine_error";
import { IUI } from "./i_ui";

export class UIFatal implements IUI {

    private _screen = $('#fatal');

    private _by = $('#fatal-by');
    private _at = $('#fatal-at');
    private _desc = $('#fatal-desc');
    private _time = $('#fatal-time');

    registerEvents(): void {
    }

    showScreen(error: EngineError, at: string) {
        this._by.html(error.threwBy);
        this._at.html(at);
        this._desc.html(error.description);
        this._time.html(`${error.time}`);
        this._screen.removeClass('d-none').addClass('d-flex');
    }
    
}