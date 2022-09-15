import { DataFilter } from "../../visualizer/data/filters/data_filter";
import { IISMRFilter, ISMRFilterGroup, ISMRFilterList } from "../../visualizer/data/filters/filter_list";
import { NumericFilterOperators } from "../../visualizer/data/filters/operators/numeric_filter_oprators";
import { RandomUtils } from "../../visualizer/utils/random_utils";
import { ConfirmationScreen } from "../confirmation_screen";
import { MessageScreen } from "../message_screen";
import { FilterCardStatusIcon } from "./filter_card_status_icons";

export class FilterCard {
    
    private _filter: DataFilter;
    private _name: string;
    private _active: boolean = true;
    private _status: FilterCardStatusIcon = FilterCardStatusIcon.INCOMPLETE;

    // IDs
    private _containerId!: string;
    private _filterNameId!: string;
    private _filterStatusIconId!: string;
    private _btnToggleId!: string;
    private _btnExcludeId!: string;
    private _valueSelectId!: string;
    private _operatorSelectId!: string;
    private _arg1Id!: string;
    private _arg2Id!: string;

    constructor(filter: DataFilter, name: string, appendTo: JQuery<HTMLElement>) {
        this._filter = filter;
        this._name = name;

        const src = this.createDefaultFilterString();
        const html = $.parseHTML(src);
        appendTo.append(html);
        this.registerEvents();

        if (filter.filter) {
            const filterTypeChildren = $(`#${this._valueSelectId} option`);
            filterTypeChildren.removeAttr('selected').filter(`[value=${filter.filter.name}]`).prop('selected', true);
        }
    }

    private createDefaultFilterString() {
        this._containerId = `df-container-${RandomUtils.randomString(10)}`;
        this._filterNameId = `df-filter-name-${RandomUtils.randomString(10)}`;
        this._filterStatusIconId = `df-filter-status-${RandomUtils.randomString(10)}`;
        
        this._btnToggleId = `df-btn-toggle-${RandomUtils.randomString(10)}`;
        this._btnExcludeId = `df-btn-exclude-${RandomUtils.randomString(10)}`;

        this._valueSelectId = `df-value-select-${RandomUtils.randomString(10)}`;
        this._operatorSelectId = `df-operator-select-${RandomUtils.randomString(10)}`;

        this._arg1Id = `df-arg1-${RandomUtils.randomString(10)}`;
        this._arg2Id = `df-arg2-${RandomUtils.randomString(10)}`;

        const filtersByCategory: Map<ISMRFilterGroup, IISMRFilter[]> = new Map();
        ISMRFilterList.forEach(f => {
            if (filtersByCategory.has(f.filterGroup)) {
                filtersByCategory.get(f.filterGroup)?.push(f);
            } else {
                filtersByCategory.set(f.filterGroup, [f]);
            }
        });

        let filtersSrc = '';
        filtersByCategory.forEach((f, fc) => {
            filtersSrc += `<optgroup label="${fc}">`;
            filtersSrc += f.map(x => `<option value="${x.name}">${x.displayName}</option>`);
            filtersSrc += `</optgroup>`;
        });

        return `
        <div class="df-filter d-flex flex-column" id="${this._containerId}">
            <div class="d-flex justify-content-between">
                <span>
                    <i class="${this._status}" id="${this._filterStatusIconId}"></i>
                    <span id="${this._filterNameId}">${this._name}</span>
                </span>
                <div>
                    <i class="bi-toggle-on icon-left cursor-pointer" id="${this._btnToggleId}"></i>
                    <i class="bi-x-circle icon-left cursor-pointer" id="${this._btnExcludeId}"></i>
                </div>
            </div>
            <select class="form-select" id="${this._valueSelectId}">
                <option value="" selected hidden>Select...</option>
                ${filtersSrc}
            </select>
            <div class="d-flex">
                <select class="form-select" id="${this._operatorSelectId}">
                    <option value="" selected hidden>Select...</option>
                    ${NumericFilterOperators.asList.map(o => `<option value="${o.name}">${o.symbol}</option>`)}
                </select>
                <input class="form-control" type="number" id="${this._arg1Id}">
                <input class="form-control d-none" type="number" id="${this._arg2Id}">
            </div>
        </div>
        `;
    }

    purge() {
        $(`#${this._containerId}`).remove();
    }

    private registerEvents() {

        $(`#${this._btnToggleId}`).on('click', () => {
            this._active = !this._active;
            if (this._active) {
                $(`#${this._btnToggleId}`).removeClass('bi-toggle-off').addClass('bi-toggle-on');
                $(`#${this._containerId}`).removeClass('df-filter-inactive');
            } else {
                $(`#${this._btnToggleId}`).removeClass('bi-toggle-on').addClass('bi-toggle-off');
                $(`#${this._containerId}`).addClass('df-filter-inactive');
            }
            visualizer.ui.dataFetcher.filterManager.revalidate();
        });

        $(`#${this._btnExcludeId}`).on('click', () => {
            new ConfirmationScreen('Are you sure?', `Do you really wish to remove the filter '${this.name}'?`, () => {
                visualizer.ui.dataFetcher.filterManager.removeCard(this);
                visualizer.ui.dataFetcher.filterManager.revalidate();
            });
        });

        $(`#${this._valueSelectId}`).on('change', () => {
            const val = $(`#${this._valueSelectId}`).val() as string;
            const newData = ISMRFilterList.find(x => x.name == val);
            if (!newData) {
                new MessageScreen('Error', `No filter was found for the selected option`);
                return;
            }
            this._filter.filter = newData;
            visualizer.ui.dataFetcher.filterManager.revalidate();
        });

        $(`#${this._operatorSelectId}`).on('change', () => {
            const val = $(`#${this._operatorSelectId}`).val() as string;
            const newData = NumericFilterOperators.asList.find(x => x.name == val);
            if (!newData) {
                new MessageScreen('Error', `No operator was found for the selected option`);
                return;
            }
            this._filter.operator = newData;
            if (newData.argCount == 2) {
                $(`#${this._arg2Id}`).removeClass('d-none').addClass('d-block');
            } else {
                $(`#${this._arg2Id}`).removeClass('d-block').addClass('d-none');
                this._filter.arguments = [this._filter.arguments[0]];
            }
            visualizer.ui.dataFetcher.filterManager.revalidate();
        });

        $(`#${this._arg1Id}`).on('input', () => {
            this._filter.arguments[0] = parseFloat($(`#${this._arg1Id}`).val() as string);
            visualizer.ui.dataFetcher.filterManager.revalidate();
        });
        $(`#${this._arg2Id}`).on('input', () => {
            this._filter.arguments[1] = parseFloat($(`#${this._arg2Id}`).val() as string);
            visualizer.ui.dataFetcher.filterManager.revalidate();
        });
    }

    get name() {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
        $(`#${this._filterNameId}`).html(name);
    }

    get isActive() {
        return this._active;
    }

    get status() {
        return this._status;
    }

    get filter() {
        return this._filter;
    }

    set status(s: FilterCardStatusIcon) {
        $(`#${this._filterStatusIconId}`).removeClass(this._status);
        this._status = s;
        $(`#${this._filterStatusIconId}`).addClass(this._status);

        if (s == FilterCardStatusIcon.ERROR) {
            $(`#${this._containerId}`).addClass('df-filter-error');
        } else {
            $(`#${this._containerId}`).removeClass('df-filter-error');
        }
    }

}