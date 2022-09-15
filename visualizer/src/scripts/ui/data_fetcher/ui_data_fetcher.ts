import { IStationInfo } from "../../visualizer/api/formats/i_station_info";
import { RandomUtils } from "../../visualizer/utils/random_utils";
import { ConfirmationScreen } from "../confirmation_screen";
import { IUI } from "../i_ui";
import { FilterManager } from "./filter_manager";

export class UIDataFetcher implements IUI {

    private _panel = $('#data-fetcher-panel');
    private _closeBtn = $('#df-close');

    private _stContainer = $('#df-station-container');
    private _stSearch = $('#df-station-search');
    private _stCards: {element: JQuery<HTMLElement>, station: IStationInfo}[] = [];

    private _clearFilters = $('#df-clear-filters');
    private _newFilterElev = $('#df-new-filter-elev');
    private _newFilterS4 = $('#df-new-filter-s4');
    private _newFilterOther = $('#df-new-filter-other');

    private _filterManager = new FilterManager();

    registerEvents(): void {
        
        this._closeBtn.on('click', () => this.hide());

        visualizer.events.on('stations-update', () => {
            this.updateStationCards();
        });

        visualizer.events.on('station-selection-update', () => {
            this.updateForSelection();
        });

        this._clearFilters.on('click', () => {
            new ConfirmationScreen('Are you Sure?', 'Are you sure you want to remove all filters?', () => this._filterManager.clearFilters());
        });

        this._newFilterElev.on('click', () => this._filterManager.createElevationFilter());
        this._newFilterS4.on('click', () => this._filterManager.createS4Filter());
        this._newFilterOther.on('click', () => this._filterManager.createDefaultFilterCard());
    }

    show() {
        this._panel.removeClass('d-none').addClass('d-flex');
    }

    hide() {
        this._panel.removeClass('d-flex').addClass('d-none');
    }

    updateForSelection() {
        if (this._stCards.length == 0) {
            this.updateStationCards();
            return;
        }

        const selectedStations = visualizer.session?.selectedStations || [];

        this._stCards.forEach(s => {
            const selected = selectedStations.find(x => x.station_id == s.station.station_id);

            if (selected) {
                s.element.prop('checked', true);
            } else {
                s.element.removeProp('checked');
            }
        });
    }

    updateStationCards() {
        let stations = visualizer.session?.stations || [];
        const selectedStations = visualizer.session?.selectedStations || [];

        this._stContainer.empty();
        this._stCards = [];

        const filterName = this._stSearch.val() as string;
        //if (filterName) stations = stations.filter(x => x.name.includes(filterName));

        stations.forEach(s => {
            const selected = selectedStations.find(x => x.station_id == s.station_id);

            const id = `df-sc-${RandomUtils.randomString(10)}`;
            const htmlSrc = this.getStationCard(s, id);
            const html = $.parseHTML(htmlSrc);
            this._stContainer.append(html);
            const jqHtml = $(`#${id}`);
            
            if (selected) {
                jqHtml.prop('checked', true);
            }

            jqHtml.on('click', () => {
                visualizer.session?.toggleStationById(s.station_id);
                this.updateForSelection();
            });

            this._stCards.push({
                element: jqHtml,
                station: s
            });
            
        });
    }

    private getStationCard(info: IStationInfo, id: string) {
        return `<input type="checkbox" class="df-station-check" id="${id}">
        <label class="df-station-entry" for="${id}">${info.name}</label>`;
    }

    get filterManager() {
        return this._filterManager;
    }
    
}