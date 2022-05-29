import { Visualizer } from "../visualizer/visualizer";
import { IUI } from "./i_ui";
import { MessageScreen } from "./message_screen";

export class UITimeline implements IUI {

    private _container = $('#timeline-container');

    private _noStationsPanel = $('#timeline-no-stations');

    private _needFetchPanel = $('#timeline-need-fetch');
    private _needFetchBtn = $('#timeline-btn-fetch');
    private _fetchingPanel = $('#timeline-fetching');

    private setActivePanel(panel: JQuery<HTMLElement>) {
        this._container.children().removeClass('d-flex show').addClass('d-none');
        panel.removeClass('d-none').addClass('d-flex show');
    }

    registerEvents() {
        this._needFetchBtn.on('click', () => {
            this.setActivePanel(this._fetchingPanel);
            this.fetchIPP();
        });
    }

    updateForSelectedStations() {
        const session = Visualizer.instance.session;
        if (!session) return;
        
        if (session.selectedStations.length == 0) {
            this.setActivePanel(this._noStationsPanel);
            return;
        }

        if (!session.timeline.isRangeCovered(session.startDate, session.endDate, session.selectedStations.map(x => x.station_id))) {
            this.setActivePanel(this._needFetchPanel);
            return;
        }
    }

    fetchIPP() {
        const session = Visualizer.instance.session;
        if (!session) return;

        Visualizer.instance.api.fetchIPP({
            startDate: session.startDate,
            endDate: session.endDate,
            ion: 350,
            satellites: 'GPS',
            stations: session.selectedStations.map(x => x.station_id)
        })
        .then(t => {
            session.addIPP(t.map(ipp => {
                ipp.id = parseInt(`${ipp.id}`);
                return ipp;
            }));
            this.updateForSelectedStations();
        })
        .catch(err => {
            this.setActivePanel(this._needFetchPanel);
            new MessageScreen('Error', 'There was an error while fetching the requested data, does it exist? is your connection ok?');
            console.log(err);
        });
    }

}