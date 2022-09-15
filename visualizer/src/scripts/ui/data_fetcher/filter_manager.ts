import { DataFilter } from "../../visualizer/data/filters/data_filter";
import { getISMRFilterByName } from "../../visualizer/data/filters/filter_list";
import { FilterCard } from "./filter_card";
import { FilterCardStatusIcon } from "./filter_card_status_icons";

export class FilterManager {

    private _filters: FilterCard[] = [];
    private _filterIndex = 1;

    private _container = $('#df-filter-container');

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
                f.status = FilterCardStatusIcon.ERROR;
            } else {
                if (f.filter.isComplete) f.status = FilterCardStatusIcon.OK;
                else f.status = FilterCardStatusIcon.INCOMPLETE;
            }
        });

        const str = this._filters
            .filter(x => x.isActive && x.status == FilterCardStatusIcon.OK)
            .map(x => `${x.filter.filter?.name} ${x.filter.operator?.asFilterStringWithArgs(...x.filter.arguments)}`)
            .join(';');
        console.log(str);
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
}