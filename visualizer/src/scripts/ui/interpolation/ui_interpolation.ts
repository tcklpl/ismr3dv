import { ISMRSession } from "../../visualizer/session/ismr_session";
import { InterpolatingFunctions } from "../../visualizer/session/moments/interpolation/interpolating_functions";
import { IUI } from "../i_ui";
import { UIInterpOptions } from "./interp_options";

export class UIInterpolation implements IUI {

    private _infoBox = $('#interp-info-box');
    private _saveBtn = $('#interp-btn-save');

    private _interpolatorSelect = $('#interp-selector');
    private _interpOptions = $('#interp-options');

    private _interpOptObj?: UIInterpOptions;
    private _newInterpFuncObj?: InterpolatingFunctions;

    registerEvents() {
        
        this.buildUI();

        this._saveBtn.on('click', () => this.save());

        visualizer.events.on('session-is-present', (status: boolean, ...rest) => {
            this.updateInfoBoxVisibility(status);
            this._newInterpFuncObj = (visualizer.session as ISMRSession).timeline.buffer.currentInterpolatingFunction;
            this.updateUI();
        });

        this._interpolatorSelect.on('change', () => {
            const find = InterpolatingFunctions.getByName(this._interpolatorSelect.val() as string);
            if (find) {
                if (find.name !== (this._newInterpFuncObj?.name ?? visualizer.session?.timeline.buffer.currentInterpolatingFunction.name)) {
                    this._newInterpFuncObj = find;
                    this.updateUI();
                }
            }
        });
    }

    buildUI() {
        InterpolatingFunctions.all.forEach(i => {
            const src = `<option value="${i.name}" ${i.name == InterpolatingFunctions.DEFAULT.name ? 'selected' : ''}>${i.name}</option>`;
            this._interpolatorSelect.append($.parseHTML(src));
        });
    }

    updateUI() {
        console.log(this._newInterpFuncObj?.name);
        $('#interp-selector option').removeAttr('selected').filter(`[value="${this._newInterpFuncObj?.name ?? visualizer.session?.timeline.buffer.currentInterpolatingFunction.name}"]`).prop('selected', true);
        if (this._interpOptObj) {
            this._interpOptObj.purge();
        }
        const params = this._newInterpFuncObj?.name == visualizer.session?.timeline.buffer.currentInterpolatingFunction.name ? visualizer.session?.timeline.buffer.currentInterpolationParameters :
                       this._newInterpFuncObj?.options.map(x => x.default) ?? [];

        this._interpOptObj = new UIInterpOptions(this._newInterpFuncObj, params);
        this._interpOptObj.buildAndAppendTo(this._interpOptions);
    }

    save() {
        const func = this._newInterpFuncObj ?? (visualizer.session as ISMRSession).timeline.buffer.currentInterpolatingFunction;
        visualizer.session?.timeline.buffer.replaceInterpolator(func, this._interpOptObj?.options.map(opt => opt.value) ?? []);
    }

    private updateInfoBoxVisibility(session: boolean) {
        if (session) {
            this._infoBox.removeClass('d-none').addClass('d-flex');
        } else {
            this._infoBox.removeClass('d-flex').addClass('d-none');
        }
    }
    
}