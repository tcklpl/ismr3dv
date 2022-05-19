import { Visualizer } from "../visualizer/visualizer";

export class UIStationsHud {

    private _counterContainer = $('#station-count-container');
    private _textCount = $('#stations-hud-count');

    private _selectNoneBtn = $('#station-hud-select-none');
    private _selectAllBtn = $('#station-hud-select-all');

    registerEvents() {
        this.update();

        this._selectNoneBtn.on('click', () => {
            Visualizer.instance.session?.clearStationSelection();
            this.update();
        });
        this._selectAllBtn.on('click', () => {
            Visualizer.instance.session?.selectAllStations()
            this.update();
        });
    }

    update() {
        const session = Visualizer.instance.session;
        this._textCount.html(`${session?.selectedStations.length ?? 0}/${session?.stations?.length ?? 0}`);
        this._counterContainer.popover('dispose')
        this._counterContainer.attr('data-bs-content', 
            session && session.selectedStations.length > 0 ? 
            session.selectedStations.map(s => `${s.name}<span class='text-secondary'>#${s.station_id}</span>`).join('<br>') :
            'There are no stations selected at the moment.'
        );
        new bootstrap.Popover(this._counterContainer[0]);
        this._counterContainer.popover({html: true, sanitize: false});
    }

}