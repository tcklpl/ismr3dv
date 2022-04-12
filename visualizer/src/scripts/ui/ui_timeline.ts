import { IStationInfo } from "../visualizer/api/formats/i_station_info";
import { ISMRSession } from "../visualizer/session/ismr_session";
import { Visualizer } from "../visualizer/visualizer";
import { ConfirmationScreen } from "./confirmation_screen";

enum TimelineState {
    SELECTING_TIME_INTERVAL, FETCHING_API, STATION_LIST
}

export class UITimeline {

    private _startDatePicker!: JQuery<HTMLElement>; 
    private _endDatePicker!: JQuery<HTMLElement>;
    private _datePickerSubmit!: JQuery<HTMLElement>;

    private _state: TimelineState = TimelineState.SELECTING_TIME_INTERVAL;
    private _uiEnabled: boolean = true;

    private _session!: ISMRSession;

    registerEvents() {

        this._startDatePicker = $('#timeline-start-date');
        this._endDatePicker = $('#timeline-end-date');
        this._datePickerSubmit = $('#timeline-dateinterval-btn');
        
        this._datePickerSubmit.on('click', () => {
            
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
            
            if (Visualizer.instance.session) {
                new ConfirmationScreen('Are you sure?', 'You are about to replace your current session.', () => this.createNewSession());
            } else {
                this.createNewSession();
            }

        });
    }

    createNewSession() {
        const startDate = new Date(this._startDatePicker.val() as string);
        const endDate = new Date(this._endDatePicker.val() as string);

        this._session = new ISMRSession(startDate, endDate);
        Visualizer.instance.session = this._session;
        
        this.state = TimelineState.FETCHING_API;

        Visualizer.instance.providers.stations.requireOnInterval(startDate, endDate)
        .then(res => this.populateStationList(res))
        .catch(err => {
            console.warn(err);
            this.enabled = true;
        });

        $('#timeline-start-msg').removeClass('d-flex').addClass('d-none');
        $('#timeline-fetching-api-msg').removeClass('d-none').addClass('d-flex');
    }

    private populateStationList(list: IStationInfo[]) {
        this._session.stations = list;
        $('#timeline-station-list').empty();

        list.forEach(s => {
            const source = `
                <div class="card" style="width: 14rem; margin-left: 10px; margin-bottom: 10px;">
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

        $('#timeline-fetching-api-msg').removeClass('d-flex').addClass('d-none');
        $('#timeline-station-list').removeClass('d-none').addClass('d-flex');
        this.state = TimelineState.STATION_LIST;
    }

    private updateUI() {
        switch(this._state) {
            case TimelineState.SELECTING_TIME_INTERVAL:
                $('#timeline-start-msg').removeClass('d-none').addClass('d-flex');
                $('#timeline-fetching-api-msg').removeClass('d-flex').addClass('d-none');
                $('#timeline-station-list').removeClass('d-flex').addClass('d-none');
                this._uiEnabled = true;
                break;
            case TimelineState.FETCHING_API:
                $('#timeline-start-msg').removeClass('d-flex').addClass('d-none');
                $('#timeline-fetching-api-msg').removeClass('d-none').addClass('d-flex');
                $('#timeline-station-list').removeClass('d-flex').addClass('d-none');
                this._uiEnabled = false;
                break;
            case TimelineState.STATION_LIST:
                $('#timeline-start-msg').removeClass('d-flex').addClass('d-none');
                $('#timeline-fetching-api-msg').removeClass('d-flex').addClass('d-none');
                $('#timeline-station-list').removeClass('d-none').addClass('d-flex');
                this._uiEnabled = true;
                break;
        }

        this._startDatePicker.prop('disabled', !this._uiEnabled);
        this._endDatePicker.prop('disabled', !this._uiEnabled);
        this._datePickerSubmit.prop('disabled', !this._uiEnabled);
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