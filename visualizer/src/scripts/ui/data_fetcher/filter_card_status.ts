
export class FilterCardStatus {

    static INCOMPLETE = new FilterCardStatus('Incomplete', 'bi-dot', 'text-secondary');
    static OK = new FilterCardStatus('OK', 'bi-check', 'text-success');
    static ERROR = new FilterCardStatus('Error', 'bi-exclamation', 'text-danger');
    static DISABLED = new FilterCardStatus('Disabled', 'bi-slash-circle', 'text-secondary');

    private _string: string;
    private _icon: string;
    private _color: string;

    private constructor(str: string, icon: string, color: string) {
        this._string = str;
        this._icon = icon;
        this._color = color;
    }

    get string() {
        return this._string;
    }

    get icon() {
        return this._icon;
    }

    get color() {
        return this._color;
    }

}