import { Vec3 } from "../engine/data_formats/vec/vec3";
import { HTMLUtils } from "../visualizer/utils/html_utils";
import { IUI } from "./i_ui";

export class UIScreenshot implements IUI {

    private _showing: boolean = false;

    private _backdrop = $('#screenshot-back');

    private _takeAsIs = $('#screenshot-take-as-is');
    private _takeCustom = $('#screenshot-take-custom');

    private _customColor = $('#screenshot-custom-color');

    registerEvents(): void {
        visualizer.io.keyboard.registerListener('p', {
            on: 'down',
            type: 'static',
            callback: () => this.onKeyP()
        });

        this._backdrop.on('click', e => {
            if (e.target !== this._backdrop[0]) return;
            this._showing = false;
            this.update();
        });

        this._takeAsIs.on('click', e => {
            visualizer.engine.renderer.requestScreenshot({
                background: 'as-is'
            });
            this._showing = false;
            this.update();
        });

        this._takeCustom.on('click', e => {
            if (e.target === this._customColor[0]) return;
            visualizer.engine.renderer.requestScreenshot({
                background: 'custom',
                customColor: HTMLUtils.hexToVec3(this._customColor.val() as string)
            });
            this._showing = false;
            this.update();
        });
    }

    private onKeyP() {
        this._showing = !this._showing;
        this.update();
    }

    private update() {
        if (this._showing) {
            this._backdrop.removeClass('d-none').addClass('d-flex');
        } else {
            this._backdrop.removeClass('d-flex').addClass('d-none');
        }
    }

}