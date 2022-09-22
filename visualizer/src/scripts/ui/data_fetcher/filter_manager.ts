import { DataFilter } from "../../visualizer/data/filters/data_filter";
import { getISMRFilterByName } from "../../visualizer/data/filters/filter_list";
import { FilterCard } from "./filter_card";
import { FilterCardStatus } from "./filter_card_status";
import { ISerializedFilter } from "./i_serialized_filter";
import { NumericFilterOperators } from "../../visualizer/data/filters/operators/numeric_filter_oprators";

export class FilterManager {

    private _filters: FilterCard[] = [];
    private _filterIndex = 1;

    private _container = $('#df-filter-container');
    private _panelNoFilters = $('#df-filter-no-filters');

    createDefaultFilterCard() {
        this._filters.push(new FilterCard(new DataFilter(), `Filter ${this._filterIndex++}`, this._container));
        this.revalidate();
    }

    createElevationFilter() {
        const df = new DataFilter();
        df.filter = getISMRFilterByName('elev');
        this._filters.push(new FilterCard(df, `Elevation Filter`, this._container));
        this.revalidate();
    }

    createS4Filter() {
        const df = new DataFilter();
        df.filter = getISMRFilterByName('s4');
        this._filters.push(new FilterCard(df, `S4 Filter`, this._container));
        this.revalidate();
    }

    revalidate() {
        const filteredFilters = this._filters.filter(x => x.isActive);
        const problematic = [];
        this._filters.forEach(f => {
            if (filteredFilters.find(x => x.filter.equals(f.filter) && x !== f && f.isActive)) {
                problematic.push(f);
                f.status = FilterCardStatus.ERROR;
            } else {
                if (!f.isActive) f.status = FilterCardStatus.DISABLED
                else if (f.filter.isComplete) f.status = FilterCardStatus.OK;
                else f.status = FilterCardStatus.INCOMPLETE;
            }
        });

        if (this._filters.length > 0) {
            this._panelNoFilters.removeClass('d-flex').addClass('d-none');
            this._container.removeClass('d-none').addClass('d-flex');
        } else {
            this._container.removeClass('d-flex').addClass('d-none');
            this._panelNoFilters.removeClass('d-none').addClass('d-flex');
        }
    }

    removeCard(card: FilterCard) {
        card.purge();
        this._filters = this._filters.filter(x => x !== card);
        this.revalidate();
    }

    clearFilters() {
        this._filters.forEach(f => f.purge());
        this._filters = [];
        this.revalidate();
    }

    constructFiltersFromSave(all: ISerializedFilter[]) {
        all.forEach(f => {
            const df = new DataFilter();
            df.arguments = f.arguments;
            df.filter = f.filter;
            df.operator = f.operatorName ? NumericFilterOperators.assertGetByName(f.operatorName) : undefined;
            const fc = new FilterCard(df, f.name, this._container);
            this._filters.push(fc);
            fc.active = f.active;
        });
        this.revalidate();
    }

    get serializedFilters() {
        return this._filters.map(f => {
            return {
                ...f.filter.asSerializable,
                active: f.isActive,
                name: f.name
            }
        });
    }

    get filtersAsString() {
        return this._filters
            .filter(x => x.isActive && x.status == FilterCardStatus.OK)
            .map(x => `${x.filter.filter?.name} ${x.filter.operator?.asFilterStringWithArgs(...x.filter.arguments)}`)
            .join(';');
    }
}