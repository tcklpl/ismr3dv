import { EngineError } from "../../engine/errors/engine_error";
import { InterpolatingFunctions } from "../../visualizer/session/moments/interpolation/interpolating_functions";
import { IInterpolatorOption } from "../../visualizer/session/moments/interpolation/i_interpolator_options";
import { RandomUtils } from "../../visualizer/utils/random_utils";

interface IInterpOpt {
    opt: IInterpolatorOption;
    value: any;
}

export class UIInterpOptions {

    private _options: IInterpOpt[] = [];
    private _events: {id: string, event: () => void}[] = [];
    private _container!: JQuery<HTMLElement>;
    private _id: string;

    constructor(interpFunction?: InterpolatingFunctions, params?: any[]) {
        const selectedInterp = interpFunction ?? visualizer.session?.timeline.buffer.currentInterpolatingFunction;
        if (!selectedInterp) throw new EngineError('Interpolating Options', 'Trying to create interp options without an active session');

        this._id = `interp-opt-box-${RandomUtils.randomString(10)}`;

        selectedInterp.options.forEach((opt, i) => {
            this._options.push({
                opt: opt,
                value: params ? params[i] : opt.default
            });
        });
        
    }

    private getOptInputAsHTMLString(opt: IInterpOpt, id: string) {
        const numberParts = opt.opt.valueType == 'number' ? `min="${opt.opt.min}" max="${opt.opt.max}" value="${opt.value}"` : '';
        return `<input type="${opt.opt.valueType}" class="form-control" ${numberParts} id="${id}">`;
    }

    private setState(name: string, id: string) {
        const res = this._options.find(x => x.opt.name == name);
        if (!res) throw new EngineError('Interpolating Options', `Trying to set unknown interp config state '${name}', available: [${this._options.map(x => x.opt.name).join(', ')}]`);
        res.value = $(`#${id}`).val();
    }

    private getHTMLSource() {
        return `
            <div id="${this._id}">
                ${this._options.map(opt => {
                    const id = `interp-opt-${RandomUtils.randomString(10)}`;
                    this._events.push({ id: id, event: () => this.setState(opt.opt.name, id) });
                    return `
                        <div class="form-group form-inline row align-items-center" style="margin-bottom: 0.1em">
                            <label class="col-sm-6" for="${id}">${opt.opt.name}</label>
                            <div class="col-sm-6">${this.getOptInputAsHTMLString(opt, id)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    private build() {
        return $.parseHTML(this.getHTMLSource());
    }

    buildAndAppendTo(to: JQuery<HTMLElement>) {
        const src = this.build();
        to.append(src);
        this._container = $(`#${this._id}`);
        this._events.forEach(e => {
            const el = $(`#${e.id}`);
            if (!el) throw new EngineError('Interpolating Options', `Failed to get element '${e.id}' to register its events`);
            el.on('input', () => e.event());
        });
    }

    purge() {
        this._container.remove();
    }

    get options() {
        return this._options;
    }

}