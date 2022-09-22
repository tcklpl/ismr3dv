import { ISatellite } from "../../visualizer/data/satellites/i_satellite";
import { SatteliteList } from "../../visualizer/data/satellites/satellite_list";
import { RandomUtils } from "../../visualizer/utils/random_utils";

export class SatelliteTypeSelectionManager {

    private _container = $('#df-data-types');
    private _cards: {info: ISatellite, element: JQuery<HTMLElement>}[] = [];
    private _selection: ISatellite[] = [];

    constructor() {
        SatteliteList.forEach(s => {
            const id = `df-sat-${RandomUtils.randomString(10)}`;
            const htmlSrc = this.getSatelliteTypeCard(s, id);
            const html = $.parseHTML(htmlSrc);
            this._container.append(html);
            const jqHtml = $(`#${id}`);

            jqHtml.on('click', () => {
                if (this._selection.find(x => x.name === s.name)) {
                    this._selection = this._selection.filter(x => x.name !== s.name);
                } else {
                    this._selection.push(s);
                }
            });

            this._cards.push({info: s, element: jqHtml});
        });
    }

    private getSatelliteTypeCard(info: ISatellite, id: string) {
        return `<input type="checkbox" class="df-satellite-check" id="${id}">
        <label class="df-satellite-entry" for="${id}">${info.displayName}</label>`;
    }

    updateForExternallySetSelection() {
        this._cards.forEach(c => {
            c.element.prop('checked', !!this._selection.some(x => x.name === c.info.name));
        });
    }

    get selectedSatellitesAsString() {
        return this._selection.map(s => s.name).join(',');
    }

    get selection() {
        return this._selection;
    }

}