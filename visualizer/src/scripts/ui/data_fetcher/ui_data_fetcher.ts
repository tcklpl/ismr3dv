import { IStationInfo } from "../../visualizer/api/formats/i_station_info";
import { getISMRFiltersAsOptgroupHTMLSource } from "../../visualizer/data/filters/filter_list";
import { RandomUtils } from "../../visualizer/utils/random_utils";
import { ConfirmationScreen } from "../confirmation_screen";
import { IUI } from "../i_ui";
import { MessageScreen } from "../message_screen";
import { FilterManager } from "./filter_manager";
import { SatelliteTypeSelectionManager } from "./satellite_type_selection_manager";

export class UIDataFetcher implements IUI {

    private _panel = $('#data-fetcher-panel');
    private _loadingScreen = $('#df-loading');
    private _closeBtn = $('#df-close');

    private _stContainer = $('#df-station-container');
    private _stSearch = $('#df-station-search');
    private _stCards: {element: JQuery<HTMLElement>, station: IStationInfo}[] = [];
    private _stBtnSelectAll = $('#df-st-select-all');
    private _stBtnSelectNone = $('#df-st-select-all');

    private _clearFilters = $('#df-clear-filters');
    private _newFilterElev = $('#df-new-filter-elev');
    private _newFilterS4 = $('#df-new-filter-s4');
    private _newFilterOther = $('#df-new-filter-other');

    private _filterManager = new FilterManager();
    private _satelliteTypeSelectionManager = new SatelliteTypeSelectionManager();

    private _ionDistance = $('#df-ion-dst');
    private _btnFetchData = $('#btn-fetch-data');

    private _dstIndexSelect = $('#df-dst-index-selector');

    constructor() {
        const dstSrc = $.parseHTML(getISMRFiltersAsOptgroupHTMLSource());
        this._dstIndexSelect.append(dstSrc);
    }

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

        this._stBtnSelectAll.on('click', () => visualizer.session?.selectAllStations());
        this._stBtnSelectNone.on('click', () => visualizer.session?.clearStationSelection());

        this._newFilterElev.on('click', () => this._filterManager.createElevationFilter());
        this._newFilterS4.on('click', () => this._filterManager.createS4Filter());
        this._newFilterOther.on('click', () => this._filterManager.createDefaultFilterCard());

        this._stSearch.on('input', () => this.updateStationCards());
        this._btnFetchData.on('click', () => {
            const ionValue = this._ionDistance.val() as string;
            let ionNumber = -1;
            try {
                ionNumber = parseInt(ionValue);
            } catch (e) {
                new MessageScreen('Error', 'There was an error while parsing the ION distance value');
                return;
            }
            this.loading = true;
            visualizer.ippFetcher.fetchData(ionNumber, this._satelliteTypeSelectionManager.selectedSatellitesAsString, () => this.loading = false);
        });
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
            const selected = !!selectedStations.find(x => x.station_id === s.station.station_id);
            s.element.prop('checked', selected);
        });
    }

    updateStationCards() {
        let stations = visualizer.session?.stations || [];
        const selectedStations = visualizer.session?.selectedStations || [];

        this._stContainer.empty();
        this._stCards = [];

        const filterName = this._stSearch.val() as string;
        if (filterName) stations = stations.filter(x => x.name.toLocaleLowerCase().includes(filterName.toLocaleLowerCase()));

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

    get satTypeManager() {
        return this._satelliteTypeSelectionManager;
    }

    private set loading(load: boolean) {
        if (load) {
            this._loadingScreen.removeClass('d-none').addClass('d-flex');
        } else {
            this._loadingScreen.removeClass('d-flex').addClass('d-none');
        }
    }

    get ionHeight() {
        const ionValue = this._ionDistance.val() as string;
        try {
            return parseInt(ionValue);
        } catch (e) {
            return 350;
        }
    }

    set ionHeight(val: number) {
        this._ionDistance.val(val);
    }
    
}