import { ISMRSession } from "../../visualizer/session/ismr_session";
import { ColorPrograms } from "../../visualizer/session/moments/colorers/color_programs/color_programs";
import { MomentColorProgram } from "../../visualizer/session/moments/colorers/color_programs/moment_color_program";
import { InterpolatingFunctions } from "../../visualizer/session/moments/interpolation/interpolating_functions";
import { IUI } from "../i_ui";
import { UIInterpOptions } from "./interp_options";

export class UIInterpolation implements IUI {

    private _infoBox = $('#interp-info-box');
    private _infoBoxGradient = $('#interp-grad');
    private _saveBtn = $('#interp-btn-save');

    private _interpolatorSelect = $('#interp-selector');
    private _interpOptions = $('#interp-options');

    private _colorerSelect = $('#colorer-selector');
    private _colorerMin = $('#colorer-bounds-min');
    private _colorerMax = $('#colorer-bounds-max');

    private _interpInfoboxMin = $('#interp-min');
    private _interpInfoboxMax = $('#interp-max');

    private _interpOptObj?: UIInterpOptions;
    private _newInterpFuncObj?: InterpolatingFunctions;
    private _newColorerObj?: MomentColorProgram;

    registerEvents() {
        
        this.buildUI();

        this._saveBtn.on('click', () => this.save());

        visualizer.events.on('session-is-present', (status: boolean, ...rest) => {
            this.updateInfoBoxVisibility(status);
            this._newInterpFuncObj = (visualizer.session as ISMRSession).timeline.buffer.interpolator.function;
            this.updateUI();
        });

        this._interpolatorSelect.on('change', () => {
            const find = InterpolatingFunctions.getByName(this._interpolatorSelect.val() as string);
            if (find) {
                if (find.name !== (this._newInterpFuncObj?.name ?? visualizer.session?.timeline.buffer.interpolator.function.name)) {
                    this._newInterpFuncObj = find;
                    this.updateUI();
                }
            }
        });

        this._colorerSelect.on('change', () => {
            const find = ColorPrograms.getByName(this._colorerSelect.val() as string);
            if (find) {
                if (find.name !== (this._newColorerObj?.name)) {
                    this._newColorerObj = find;
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

        ColorPrograms.all.forEach(c => {
            const src = `<option value="${c.name}" class="${c.cssClass}-opt" ${c.name == ColorPrograms.DEFAULT.name ? 'selected' : ''}>${c.name}</option>`;
            this._colorerSelect.append($.parseHTML(src));
        });
    }

    updateUI() {
        console.log(this._newInterpFuncObj?.name);
        $('#interp-selector option').removeAttr('selected').filter(`[value="${this._newInterpFuncObj?.name ?? visualizer.session?.timeline.buffer.interpolator.function.name}"]`).prop('selected', true);
        if (this._interpOptObj) {
            this._interpOptObj.purge();
        }
        const params = this._newInterpFuncObj?.name == visualizer.session?.timeline.buffer.interpolator.function.name ? visualizer.session?.timeline.buffer.interpolator.parameters :
                       this._newInterpFuncObj?.options.map(x => x.default) ?? [];

        this._interpOptObj = new UIInterpOptions(this._newInterpFuncObj, params);
        this._interpOptObj.buildAndAppendTo(this._interpOptions);

        const previewClass = this._newColorerObj?.cssClass ?? visualizer.session?.timeline.buffer.colorer.selectedProgram.cssClass;

        $('#colorer-preview').removeClass().addClass(`${previewClass}-opt`);
        this._infoBoxGradient.removeClass().addClass(`${previewClass}`);
    }

    save() {
        const func = this._newInterpFuncObj ?? (visualizer.session as ISMRSession).timeline.buffer.interpolator.function;
        visualizer.session?.timeline.buffer.replaceInterpolator(func, this._interpOptObj?.options.map(opt => opt.value) ?? [], false);

        const colorerProgram = this._newColorerObj ?? (visualizer.session as ISMRSession).timeline.buffer.colorer.selectedProgram;
        const min = parseFloat(this._colorerMin.val() as string);
        const max = parseFloat(this._colorerMax.val() as string);
        this._interpInfoboxMin.html(`${min.toFixed(2)}`);
        this._interpInfoboxMax.html(`${max.toFixed(2)}`);
        visualizer.session?.timeline.buffer.replaceColorer(colorerProgram, min, max);
    }

    private updateInfoBoxVisibility(session: boolean) {
        if (session) {
            this._infoBox.removeClass('d-none').addClass('d-flex');
        } else {
            this._infoBox.removeClass('d-flex').addClass('d-none');
        }
    }
    
}