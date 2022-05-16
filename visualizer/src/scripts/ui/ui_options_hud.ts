import { HTMLUtils } from "../visualizer/utils/html_utils";
import { Visualizer } from "../visualizer/visualizer";
import { ConfirmationScreen } from "./confirmation_screen";
import { MessageScreen } from "./message_screen";

export class UIOptionsHud {

    private _saveSessionBtn!: JQuery<HTMLElement>;
    private _exportSessionBtn!: JQuery<HTMLElement>;
    private _timelineBtn!: JQuery<HTMLElement>;
    private _newSessionBtn!: JQuery<HTMLElement>;

    registerEvents() {
        this._saveSessionBtn = $('#cfg-save-btn');
        this._exportSessionBtn = $('#cfg-export-btn');
        this._timelineBtn = $('#cfg-timeline-btn');
        this._newSessionBtn = $('#cfg-session-btn');

        this._saveSessionBtn.on('click', () => this.saveSession());
        this._exportSessionBtn.on('click', () => this.exportSession());

        this._newSessionBtn.on('click', () => {
            Visualizer.instance.ui.session.resetUI();
            if (Visualizer.instance.session) {
                new ConfirmationScreen(
                    'Are you sure?', 
                    `<b>You are about to create a new session overwriting your current one, any unsaved changes will be lost.</b><br>
                    <span class="text-secondary">You can safely cancel the session wizard until you fetch the API for data and this session will still
                    be left intact, however if you query the API the session will be overwritten as soon as you get the
                    data from the API</span>`, 
                    () => $('#session-screen-container').collapse('show'));
            } else {
                $('#session-screen-container').collapse('show');
            }
        });
    }

    setSessionRelatedButtonsEnabled(state: boolean) {
        this._saveSessionBtn.prop('disabled', !state || !Visualizer.instance.idb.isAvailable);
        this._exportSessionBtn.prop('disabled', !state);
        this._timelineBtn.prop('disabled', !state);
    }

    private saveSession() {
        Visualizer.instance.session?.save();
    }

    private exportSession() {
        if (!Visualizer.instance.session) {
            new MessageScreen('Error', 'You are not currently in a session');
            return;
        }
        const sess = Visualizer.instance.session;
        HTMLUtils.downloadObjectAsFile(sess.asSerializable, sess.name + '.json');
    }
}