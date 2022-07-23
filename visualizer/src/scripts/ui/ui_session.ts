import { IServerInfo } from "../visualizer/api/formats/i_server_info";
import { ISMRSession } from "../visualizer/session/ismr_session";
import { ISessionSave } from "../visualizer/session/i_session_save";
import { RandomUtils } from "../visualizer/utils/random_utils";
import { ConfirmationScreen } from "./confirmation_screen";
import { IUI } from "./i_ui";
import { MessageScreen } from "./message_screen";

export class UISession implements IUI {

    private _serverInfo!: IServerInfo;

    private _tabsContainer = $('#session-screen-tabs');
    private _cancelBtn = $('#ns-cancel-btn');

    private _initialPanel = $('#ns-initial-panel');
    private _newFromApi = $('#ns-new');
    private _newFromFile = $('#ns-load');
    private _newCustom = $('#ns-custom');

    private _namePanel = $('#ns-name-panel');
    private _nameField = $('#ns-session-name');
    private _nameFinishBtn = $('#ns-btn-name-ok');

    private _datePanel = $('#ns-date-panel');
    private _datePanelTabSelectors = $('#ns-date-normal-selector');
    private _datePanelTabShowcase = $('#ns-date-showcase');
    private _datePanelTabLoading = $('#ns-date-spinner');
    private _dateStart = $('#ns-date-start');
    private _dateEnd = $('#ns-date-end');
    private _dateFinishBtn = $('#ns-date-finish-btn');
    private _dateShowcaseFinishBtn = $('#ns-date-showcase-btn');
    private _dateGoBackBtn = $('[id^=ns-load-go-back-name-]');

    private _finishPanel = $('#ns-finish-panel');
    private _finishSaveLocally = $('#ns-finish-save-on-browser');
    private _finishAutosave = $('#ns-finish-autosave');
    private _finishAutosaveInterval = $('#ns-finish-autosave-interval');
    private _finishFinalButton = $('#ns-btn-return-to-visualizer');
    private _finishNoIDBLabel = $('#ns-finish-no-idb');

    private _loadPanel = $('#ns-load-panel');
    private _loadIDBError = $('#ns-load-idb-error');
    private _loadEmpty = $('#ns-load-empty');
    private _loadStationList = $('#ns-load-station-list');
    private _loadGoBackBtn = $('[id^=ns-load-go-back-reset-]');
    private _loadSpinner = $('#ns-load-station-list-loading');

    private newScreenChangeHovered(newSelected?: JQuery<HTMLElement>) {
        this._initialPanel.children().removeClass('text-primary').addClass('text-secondary');
        newSelected?.removeClass('text-secondary').addClass('text-primary');
    }

    private setActivePanel(panel: JQuery<HTMLElement>) {
        this._tabsContainer.children().removeClass('active show').addClass('d-none');
        panel.removeClass('d-none').addClass('active show');
    }

    private setProgressBarCompletion(level: number) {
        $('#session-steps').children().removeClass('active');
        for (let i = 1; i <= level; i++) {
            $(`#ns-pb-step${i}`).addClass('active');
        }
    }

    registerEvents() {
        this._serverInfo = visualizer.serverInfo;

        this._cancelBtn.on('click', () => this.cancel());

        this._newFromApi.on('mouseover', () => this.newScreenChangeHovered(this._newFromApi)).on('click', () => this.newSessionFromAPI());
        this._newFromFile.on('mouseover', () => this.newScreenChangeHovered(this._newFromFile)).on('click', () => this.newSessionLoadFromFile());
        this._newCustom.on('mouseover', () => this.newScreenChangeHovered(this._newCustom)).on('click', () => this.newSessionCustomData());
        this._initialPanel.children().on('mouseleave', () => this.newScreenChangeHovered());

        this._nameFinishBtn.on('click', () => this.newSessionSelectDate());

        this._dateFinishBtn.on('click', () => this.fetchStationList());
        this._dateGoBackBtn.on('click', () => this.newSessionFromAPI());
        this._dateShowcaseFinishBtn.on('click', () => this.fetchStationList());

        this._finishSaveLocally.on('click', () => {
            if (visualizer.session) visualizer.session.config.save_on_browser = this._finishSaveLocally.prop('checked');
        });
        this._finishAutosave.on('click', () => {
            if (visualizer.session) visualizer.session.config.auto_save = this._finishAutosave.prop('checked');
        });
        this._finishAutosaveInterval.on('change', () => {
            if (visualizer.session) visualizer.session.config.auto_save_interval_minutes = this._finishAutosaveInterval.val() as number;
        });

        this._finishFinalButton.on('click', () => visualizer.session?.save());

        this._loadGoBackBtn.on('click', () => this.resetUI());
    }

    resetUI() {
        this.setActivePanel(this._initialPanel);
        this.setProgressBarCompletion(1);
        this._nameField.val('');
        this._dateStart.val('');
        this._dateEnd.val('');
        this._finishSaveLocally.prop('checked', true);
        this._finishAutosave.prop('checked', true);
        this._finishAutosaveInterval.val(5);
        this._cancelBtn.show();

        if (!visualizer.idb.isAvailable) {
            this._finishSaveLocally.removeAttr('checked');
            this._finishSaveLocally.prop('disabled', true);
            this._finishAutosave.removeAttr('checked');
            this._finishAutosave.prop('disabled', true);
            this._finishAutosaveInterval.prop('disabled', true);
            this._finishNoIDBLabel.removeClass('d-none').addClass('row');
        }
    }
    
    private cancel() {
        new ConfirmationScreen('Are you sure?', 'You are about to cancel the session creation, everything will be discarded.', () => {
            $('#session-screen-container').collapse('hide');
        });
    }

    private newSessionFromAPI() {
        this.setActivePanel(this._namePanel);
        this.setProgressBarCompletion(2);
    }

    private newSessionLoadFromFile() {
        this.constructLoadSessionPanel();
        this.setActivePanel(this._loadPanel);
        this.setProgressBarCompletion(2);
    }

    private newSessionCustomData() {
        alert('Not yet implemented');
    }

    private newSessionSelectDate() {
        this.setActivePanel(this._datePanel);
        this.setProgressBarCompletion(3);
        this.switchDatePanelTab(this._serverInfo.showcase_mode ? this._datePanelTabShowcase : this._datePanelTabSelectors);
    }

    private switchDatePanelTab(selected: JQuery<HTMLElement>) {
        this._datePanel.children().removeClass('d-flex active show').addClass('d-none');
        selected.removeClass('d-none').addClass('d-flex active show');
    }

    private validateDateInput() {
        if (!this._dateStart.val() || !this._dateEnd.val()) return false;
        const startDate = new Date(this._dateStart.val() as string);
        const endDate = new Date(this._dateEnd.val() as string);
        if (startDate.getTime() > endDate.getTime()) return false;
        return [ startDate, endDate ];
    }

    private fetchStationList() {
        let startDate: Date, endDate: Date;
        if (this._serverInfo.showcase_mode) {
            startDate = this._serverInfo.showcase_start_date;
            endDate = this._serverInfo.showcase_end_date;
        } else {
            const dates = this.validateDateInput();
            if (!dates) {
                this._dateStart.addClass('border-danger');
                this._dateEnd.addClass('border-danger');
                return;
            }
            [startDate, endDate] = dates;
        }
        this.switchDatePanelTab(this._datePanelTabLoading);
        visualizer.api.fetchStations(startDate, endDate)
            .then(list => {
                if (list.length > 0) {
                    const session = new ISMRSession(startDate, endDate, this._nameField.val() as string);
                    session.stations = list;
                    visualizer.session = session;
                    this.showFinalPanel();
                } else {
                    new MessageScreen('Error', 'No available stations were found on the provided time interval');
                    this.switchDatePanelTab(this._serverInfo.showcase_mode ? this._datePanelTabShowcase : this._datePanelTabSelectors);
                }
            })
            .catch(err => {
                new MessageScreen('Error', err);
                this.switchDatePanelTab(this._serverInfo.showcase_mode ? this._datePanelTabShowcase : this._datePanelTabSelectors);
            });
    }

    showFinalPanel() {
        this._cancelBtn.hide();
        visualizer.ui.stationsHud.update();

        const session = visualizer.session;
        if (session) {
            this._finishSaveLocally.prop('checked', session.config.save_on_browser);
            this._finishAutosave.prop('checked', session.config.auto_save);
            this._finishAutosaveInterval.val(session.config.auto_save_interval_minutes);
        }

        this.setProgressBarCompletion(4);
        this.setActivePanel(this._finishPanel);
        visualizer.ui.optionsHud.setSessionRelatedButtonsEnabled(true);
    }

    private createLoadedSessionCard(save: ISessionSave, loadSessionId: string, deleteSessionId: string) {
        const creationDate = save.creation_date.toLocaleString();
        const startDate = save.start_date.toLocaleString();
        const endDate = save.end_date.toLocaleString();

        return `
        <div class="card ns-hoverable flex-grow-1" style="margin-right: 0.5em; margin-bottom: 0.5em;">
            <div class="card-body h-100 container-fluid">
                <div>
                    <i class="bi-hdd-fill" style="font-size: 1.5em; margin-right: 0.5em; vertical-align: middle;"></i>${save.name}
                </div>
                <div style="cursor: pointer" class="text-primary session-card-hover" id="${loadSessionId}">
                    <i class="bi-box-arrow-right icon-left"></i><span>Load</span>
                </div>
                <div style="color: red; cursor: pointer" class="session-card-hover" id="${deleteSessionId}">
                    <i class="bi-trash icon-left"></i><span>Delete</span>
                </div>
                <hr>
                <div class="row">
                    <div class="col-10 d-flex flex-column h-100">
                        <span title="Creation Date"><i class="bi-calendar-event icon-left"></i>${creationDate}</span>
                        <span title="Date Range"><i class="bi-calendar-range icon-left"></i>${startDate} - ${endDate}</span>
                    </div>
                    <div class="col-2">
                        <i class="bi-broadcast-pin icon-left"></i>${save.station_list.length}
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    private constructLoadSessionPanel() {

        const setLoadPanel = (panel: JQuery<HTMLElement>) => {
            this._loadIDBError.removeClass('d-flex active show').addClass('d-none');
            this._loadEmpty.removeClass('d-flex active show').addClass('d-none');
            this._loadStationList.removeClass('d-flex active show').addClass('d-none');
            this._loadSpinner.removeClass('d-flex active show').addClass('d-none');
            panel.removeClass('d-none').addClass('d-flex active show');
        };

        setLoadPanel(this._loadSpinner);

        visualizer.idb.sessionController.fetchAll().then(sessions => {
            if (sessions.length > 0) {
                this._loadStationList.empty();
                sessions.forEach(s => {
                    const loadId = `seb-${RandomUtils.randomString(10)}`;
                    const deleteId = `seb-${RandomUtils.randomString(10)}`;
                    const src = this.createLoadedSessionCard(s, loadId, deleteId);
                    const html = $.parseHTML(src);
                    this._loadStationList.append(html);
                    $(`#${loadId}`).on('click', () => {
                        this.loadSession(s);
                    });
                    $(`#${deleteId}`).on('click', () => {
                        new ConfirmationScreen('Are you sure?', `Do you really wish to delete the session '${s.name}'? This action is irreversible.`, () => {
                            visualizer.idb.sessionController.remove(s)
                            .then(() => {
                                this.constructLoadSessionPanel();
                            })
                            .catch(e => {
                                new MessageScreen('Error', 'There was an error while removing the required session, you can check the console for more info.');
                                console.error(e);
                            });
                        });
                    });
                });
                setLoadPanel(this._loadStationList);
            } else {
                setLoadPanel(this._loadEmpty);
            }
        })
        .catch(() => {
            setLoadPanel(this._loadIDBError);
        });
    }

    private loadSession(save: ISessionSave) {
        const session = ISMRSession.constructFromSave(save);
        visualizer.session = session;
        visualizer.ui.timeline.updateForSelectedStations();
        this.showFinalPanel();
    }
}