import { IStationInfo } from "../visualizer/api/formats/i_station_info";
import { ISMRSession } from "../visualizer/session/ismr_session";
import { Visualizer } from "../visualizer/visualizer";
import { ConfirmationScreen } from "./confirmation_screen";
import { TimelineState } from "./timeline_state";

export class UITimeline {

    private _startDatePicker!: JQuery<HTMLElement>; 
    private _endDatePicker!: JQuery<HTMLElement>;
    private _datePickerSubmit!: JQuery<HTMLElement>;

    private _state: TimelineState = TimelineState.SELECTING_TIME_INTERVAL;
    private _uiEnabled: boolean = true;

    private _showcaseMode!: boolean;

    private _session!: ISMRSession;

    registerEvents() {

        this._showcaseMode = Visualizer.instance.serverInfo.showcase_mode;

        this._startDatePicker = $('#timeline-start-date');
        this._endDatePicker = $('#timeline-end-date');
        this._datePickerSubmit = $('#timeline-dateinterval-btn');
        
        // normal station search button
        this._datePickerSubmit.on('click', () => {
            // If it's in showcase mode the user shouldn't even be pressing this button
            if (this._showcaseMode) return;
            
            this._startDatePicker.removeClass('border-danger');
            this._endDatePicker.removeClass('border-danger');

            let inputOk = true;

            if (!this._startDatePicker.val()) {
                this._startDatePicker.addClass('border-danger');
                inputOk = false;
            }

            if (!this._endDatePicker.val()) {
                this._endDatePicker.addClass('border-danger');
                inputOk = false;
            }

            if (!inputOk) return;

            const startDate = new Date(this._startDatePicker.val() as string);
            const endDate = new Date(this._endDatePicker.val() as string);
            
            if (Visualizer.instance.session) {
                new ConfirmationScreen('Are you sure?', 'You are about to replace your current session.', () => this.createNewSession(startDate, endDate));
            } else {
                this.createNewSession(startDate, endDate);
            }

        });

        // showcase station seach button
        $('#timeline-showcase-stations-btn').on('click', () => {
            if (!this._showcaseMode) return;
            this.createNewSession(Visualizer.instance.serverInfo.showcase_start_date, Visualizer.instance.serverInfo.showcase_end_date);
        });

        this.updateForShowcase(Visualizer.instance.serverInfo.showcase_mode);
    }

    createNewSession(startDate: Date, endDate: Date) {
        this._session = new ISMRSession(startDate, endDate);
        Visualizer.instance.session = this._session;
        
        this.state = TimelineState.FETCHING_API;

        Visualizer.instance.providers.stations.requireOnInterval(startDate, endDate)
        .then(res => this.populateStationList(res))
        .catch(err => {
            console.warn(err);
            this.state = TimelineState.FETCH_ERROR;
            this.enabled = true;
        });
    }

    private populateStationList(list: IStationInfo[]) {
        this._session.stations = list;
        $('#timeline-station-list').empty();

        list.forEach(s => {
            const source = `
                <div class="card timeline-station-card">
                    <div class="card-body row">
                        <div class="col-4 d-flex align-items-center justify-content-center h-100">
                            <i class="bi-broadcast-pin" style="font-size: 3em;"></i>
                        </div>
                        <div class="col-8">
                            <span class="text-muted fs-6">#:station_id</span><br>
                            <span class="fs-4">:station_name</span>
                        </div>
                    </div>
                </div>
            `
            .replace(':station_id', `${s.station_id}`)
            .replace(':station_name', `${s.name}`);

            const html = $.parseHTML(source);
            $('#timeline-station-list').append(html);
        });

        this.state = TimelineState.STATION_LIST;
    }

    private setVisible(element: JQuery<HTMLElement>, visible: boolean, display: string = 'flex') {
        visible ? element.removeClass('d-none').addClass(`d-${display}`) : element.removeClass(`d-${display}`).addClass('d-none');
    }

    private updateForShowcase(showcase: boolean) {
        this.setVisible($('#timeline-date-msg-showcase'), showcase);
        this.setVisible($('#timeline-date-selector'), !showcase, 'block');
    }

    private updateUI() {
        this._uiEnabled = !this._state.blocked;
        this.setVisible($('#timeline-start-msg'), this._state.startMsgVisible);
        this.setVisible($('#timeline-fetching-api-msg'), this._state.fetchMsgVisible);
        this.setVisible($('#timeline-error-msg'), this._state.fetchErrorMsgVisible);
        this.setVisible($('#timeline-station-list'), this._state.stationListVisible);

        this._startDatePicker.prop('disabled', !this._uiEnabled);
        this._endDatePicker.prop('disabled', !this._uiEnabled);
        this._datePickerSubmit.prop('disabled', !this._uiEnabled);
        $('#timeline-showcase-stations-btn').prop('disabled', !this._uiEnabled);
    }

    private set enabled(value: boolean) {
        this._uiEnabled = value;
        this.updateUI();
    }

    private set state(s: TimelineState) {
        this._state = s;
        this.updateUI();
    }

}