import { RandomUtils } from "../visualizer/utils/random_utils";

export class CustomAlert {

    private _alertId: string;

    constructor(type: string, message: string, autoCloseInterval?: number) {
        this._alertId = RandomUtils.randomString(5);
        const src = `
        <div class="alert alert-${type} d-flex align-items-center" role="alert" id="alert-${this._alertId}">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" style="margin-left: 0.5em;"></button>
        </div>`;
        const htmlElement = $.parseHTML(src);
        $('#alert-container').append(htmlElement);
        if (autoCloseInterval) {
            setInterval(() => {
                const element = $(`#alert-${this._alertId}`);
                if (element.length > 0) {
                    element.remove();
                }
            }, autoCloseInterval * 1000);
        }
    }
}