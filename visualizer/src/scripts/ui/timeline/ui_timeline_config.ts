import { IUI } from "../i_ui"; 

export type TimelineNormalizator = 'minmax' | 'zscore';
export type TimelineNormValue = 'min' | 'max' | 'avg' | 'med';

export class UITimelineConfig implements IUI {

    private _normalizatorSelect = $('#normalizator-selector');
    private _normalizationValue = $('#normalizator-value-selector');
    private _saveBtn = $('#timeline-btn-save');

    registerEvents(): void {
        
        this._saveBtn.on('click', () => {
            visualizer.ui.timeline.timelineNormalizator = this._normalizatorSelect.val() as TimelineNormalizator;
            visualizer.ui.timeline.timelineNormalValue = this._normalizationValue.val() as TimelineNormValue;
            visualizer.ui.timeline.draw2DIndicatorGraph();
        });

        visualizer.events.on('session-is-present', (...rest) => {
            $('#normalizator-selector option').removeAttr('selected').filter(`[value="${visualizer.ui.timeline.timelineNormalizator}"]`).prop('selected', true);
            $('#normalizator-value-selector option').removeAttr('selected').filter(`[value="${visualizer.ui.timeline.timelineNormalValue}"]`).prop('selected', true);
        });
    }
}