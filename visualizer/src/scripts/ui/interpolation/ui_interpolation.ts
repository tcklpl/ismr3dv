import { ISMRSession } from "../../visualizer/session/ismr_session";
import { ColorPrograms } from "../../visualizer/session/moments/colorers/color_programs/color_programs";
import { MomentColorProgram } from "../../visualizer/session/moments/colorers/color_programs/moment_color_program";
import { InterpolatingFunctions } from "../../visualizer/session/moments/interpolation/interpolating_functions";
import { IUI } from "../i_ui";
import { UIInterpOptions } from "./interp_options";

export class UIInterpolation implements IUI {

    private _infoBox = $('#interp-info-box');
    private _infoBoxValueName = $('#interp-info-box-value-name');
    private _infoBoxGradient = $('#interp-grad');
    private _saveBtn = $('#interp-btn-save');

    private _interpolatorSelect = $('#interp-selector');
    private _interpOptions = $('#interp-options');
    private _interpThreads = $('#interp-threads');

    private _colorerSelect = $('#colorer-selector');
    private _colorerMin = $('#colorer-bounds-min');
    private _colorerMax = $('#colorer-bounds-max');
    private _colorerBudget = $('#colorer-budget');

    private _interpInfoboxMin = $('#interp-min');
    private _interpInfoboxMax = $('#interp-max');

    private _precisionWidth = $('#interp-precision-width');
    private _precisionHeight = $('#interp-precision-height');

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

        visualizer.events.on('data-fetcher-target-index-update', () => {
            this._infoBoxValueName.html(visualizer.ui.dataFetcher.targetDataIndex.displayName);
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

        const bounds = (visualizer.session as ISMRSession).timeline.buffer.colorer.bounds;
        this._interpInfoboxMin.html(`${bounds.x.toFixed(2)}`);
        this._interpInfoboxMax.html(`${bounds.y.toFixed(2)}`);
        this._colorerMin.val(bounds.x);
        this._colorerMax.val(bounds.y);
        $('#colorer-selector option').removeAttr('selected').filter(`[value="${this._newColorerObj?.name ?? visualizer.session?.timeline.buffer.colorer.selectedProgram.name}"]`).prop('selected', true);

        this._precisionWidth.val(visualizer.session?.timeline.buffer.bufferSize.x ?? 360);
        this._precisionHeight.val(visualizer.session?.timeline.buffer.bufferSize.y ?? 180);

        this._interpThreads.val(visualizer.session?.timeline.buffer.interpolator.threadCount ?? 4);
        this._colorerBudget.val(visualizer.session?.timeline.buffer.colorer.budgetPerFrame ?? 5);
        this._infoBoxValueName.html(visualizer.ui.dataFetcher.targetDataIndex.displayName);
    }

    save() {
        const session = visualizer.session as ISMRSession;
        // Update the resolution, we'll set the resolution first because then the new interpolator and colorer will already be
        // in the correct resolution.
        const width = parseInt(this._precisionWidth.val() as string);
        const height = parseInt(this._precisionHeight.val() as string);
        session.timeline.buffer.setResolution(width, height);

        // Update the interpolator
        const threadCount = parseInt(this._interpThreads.val() as string);
        session.timeline.buffer.interpolator.threadCount = threadCount;
        const func = this._newInterpFuncObj ?? session.timeline.buffer.interpolator.function;
        session.timeline.buffer.replaceInterpolator(func, this._interpOptObj?.options.map(opt => opt.value) ?? [], false);

        // Update the colorer
        const colorerProgram = this._newColorerObj ?? session.timeline.buffer.colorer.selectedProgram;
        const min = parseFloat(this._colorerMin.val() as string);
        const max = parseFloat(this._colorerMax.val() as string);
        const budget = parseInt(this._colorerBudget.val() as string);
        session.timeline.buffer.colorer.budgetPerFrame = budget;
        session.timeline.buffer.replaceColorer(colorerProgram, min, max);

        this.updateUI();
    }

    private updateInfoBoxVisibility(session: boolean) {
        if (session) {
            this._infoBox.removeClass('d-none').addClass('d-flex');
        } else {
            this._infoBox.removeClass('d-flex').addClass('d-none');
        }
    }
    
}