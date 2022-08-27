import { Vec2 } from "../engine/data_formats/vec/vec2";
import { MUtils } from "../engine/utils/math_utils";
import { ISMRSession } from "../visualizer/session/ismr_session";
import { DateUtils } from "../visualizer/utils/date_utils";
import { IUI } from "./i_ui";
import { MessageScreen } from "./message_screen";

export class UITimeline implements IUI {

    private _container = $('#timeline-container');

    private _noStationsPanel = $('#timeline-no-stations');

    private _needFetchPanel = $('#timeline-need-fetch');
    private _needFetchBtn = $('#timeline-btn-fetch');
    private _fetchingPanel = $('#timeline-fetching');

    private _timelinePanel = $('#timeline-panel');
    private _timelineBarBg = $('#tl-bar-background');

    private _tlActiveMarker = $('#tl-bar-active');
    private _tlGhostMarker = $('#tl-bar-ghost');
    private _tlBufferBar = $('#tl-bar-buffered');
    private _tlColorBar = $('#tl-bar-colored');

    private _tlMomentName = $('#tl-controls-name');

    private _btnFirst = $('#tl-btn-first');
    private _btnPrev = $('#tl-btn-prev');
    private _btnPlay = $('#tl-btn-play');
    private _btnNext = $('#tl-btn-next');
    private _btnLast = $('#tl-btn-last');

    private _tlPlayIntervalSelect = $('#tl-play-interval');

    private _opacityControl = $('#tl-opacity');
    private _opacityLabel = $('#tl-opacity-label');

    private _activeMoment = 0;
    private _hoveredMoment = 0;
    private _timelineMode: 'static' | 'user-hovering' = 'static';
    private _isPlaying = false;
    private _playInterval = 1000;
    
    private _bufferBounds = new Vec2(0, 0);
    private _colorBounds = new Vec2(0, 0);

    private setActivePanel(panel: JQuery<HTMLElement>) {
        this._container.children().removeClass('d-flex show').addClass('d-none');
        panel.removeClass('d-none').addClass('d-flex show');
    }

    registerEvents() {
        this._needFetchBtn.on('click', () => {
            this.setActivePanel(this._fetchingPanel);
            this.fetchIPP();
        });

        this._timelineBarBg.on('click', e => {
            const prog = e.offsetX / (this._timelineBarBg.width() as number);
            const moment = Math.round(prog * (this.session.timeline.currentMoments.length - 1));
            this.setMoment(moment);
        });

        this._timelineBarBg.on('mousemove', e => {
            const prog = e.offsetX / (this._timelineBarBg.width() as number);
            this._hoveredMoment = Math.round(prog * (this.session.timeline.currentMoments.length - 1));
            this._timelineMode = 'user-hovering';
            this.updateCurrentMomentMarkerAndInfo();
        });

        this._timelineBarBg.on('mouseleave', e => {
            this._timelineMode = 'static';
            this._hoveredMoment = -1;
            this.updateCurrentMomentMarkerAndInfo();
        });

        visualizer.events.on('moment-buffered', (args: any[]) => {
            const moment = args[0] as number;
            if (moment < this._bufferBounds.x) this._bufferBounds.x = moment;
            if (moment > this._bufferBounds.y) this._bufferBounds.y = moment;
            this.updateBufferIndicators();
            this.updateCurrentMomentMarkerAndInfo();
        });

        visualizer.events.on('moment-colored', (args: any[]) => {
            const moment = args[0] as number;
            if (moment < this._colorBounds.x) this._colorBounds.x = moment;
            if (moment > this._colorBounds.y) this._colorBounds.y = moment;
            this.updateBufferIndicators();
            this.updateCurrentMomentMarkerAndInfo();
        });

        visualizer.events.on('timeline-buffer-bounds-update', (args: any[]) => {
            const bounds = args[0] as Vec2;
            const alreadyBuffered = args[1] as Vec2;

            this._bufferBounds.x = bounds.x;
            this._bufferBounds.y = Math.min(alreadyBuffered.x, bounds.y);

            this._colorBounds.x = this._bufferBounds.x;
            this._colorBounds.y = this._bufferBounds.y;

            this.updateBufferIndicators();
            this.updateCurrentMomentMarkerAndInfo();
        });

        visualizer.events.on('moment-interpolation-complete', (args: any[]) => {
            const bounds = args[0] as Vec2;
            this._bufferBounds = bounds.clone();

            this.updateBufferIndicators();
            this.updateCurrentMomentMarkerAndInfo();
        });

        visualizer.events.on('all-moments-processed', (args: any[]) => {
            const bounds = args[0] as Vec2;
            this._bufferBounds = bounds.clone();
            this._colorBounds = this._bufferBounds.clone();

            this.updateBufferIndicators();
            this.updateCurrentMomentMarkerAndInfo();
        });

        this._btnFirst.on('click', () => {
            this.setMoment(0);
        })

        this._btnPrev.on('click', () => {
            if (this._activeMoment > 0) {
                this.setMoment(this._activeMoment - 1);
            }
        });

        this._btnPlay.on('click', () => {
            this._isPlaying = !this._isPlaying;
            if (this._isPlaying) {
                this._btnPlay.removeClass('bi-play-fill').addClass('bi-pause-fill');
                this.playTask();
            } else {
                this._btnPlay.removeClass('bi-pause-fill').addClass('bi-play-fill');
            }
        });

        this._btnNext.on('click', () => {
            if (this._activeMoment < (this.session.timeline.currentMoments.length - 1)) {
                this.setMoment(this._activeMoment + 1);
            }
        });

        this._btnLast.on('click', () => {
            this.setMoment(this.session.timeline.currentMoments.length - 1);
        });

        this._tlPlayIntervalSelect.on('input', () => {
            const valStr = this._tlPlayIntervalSelect.val() as string || "";
            try {
                const val = Number.parseInt(valStr);
                this._playInterval = val;
            } catch (e) {
                console.warn(e);
            }
        });

        this._opacityControl.on('input', () => {
            const value = this._opacityControl.val() as number;
            this.ippOpacity = value;
        });
    }

    private playTask() {
        if (this._isPlaying) {
            if (this._activeMoment < (this.session.timeline.currentMoments.length - 1)) {
                this.setMoment(this._activeMoment + 1);
            } else {
                this._isPlaying = false;
                this._btnPlay.removeClass('bi-pause-fill').addClass('bi-play-fill');
            }
            setTimeout(() => this.playTask(), this._playInterval);
        }
    }

    private setMoment(index: number) {
        this._activeMoment = index;
        this.updateCurrentMomentMarkerAndInfo();
        this.session.timeline.buffer.getMomentByIndex(this._activeMoment);
        visualizer.ui.bottomHud.currentDateLabel = this.session.timeline.currentMoments[this._activeMoment].date.toLocaleString();
    }

    getMomentOffsetPercentage(index: number) {
        const total = this.session.timeline.currentMoments.length;
        if (index < 0 || index > (total - 1)) {
            console.warn(`Invalid index for moment offset. Trying to set index ${index} for a list of size ${total}`);
            return 0;
        }
        return index / total * 100;
    }

    updateCurrentMomentMarkerAndInfo() {
        let momentToQuery = 0;
        let updateGhost = true;
        switch(this._timelineMode) {
            case 'static':
                momentToQuery = this._activeMoment;
                break;
            case 'user-hovering':
                momentToQuery = this._hoveredMoment;
                updateGhost = false;
                break;
        }
        if (momentToQuery < 0 || momentToQuery > (this.session.timeline.currentMoments.length - 1)) {
            console.warn(`Failed to update to moment ${momentToQuery}: Out of bounds (0, ${this.session.timeline.currentMoments.length - 1})`);
            return;
        }
        const curPercentage = this.getMomentOffsetPercentage(momentToQuery);
        this._tlActiveMarker.css('left', `${curPercentage}%`);

        if (updateGhost) {
            this._tlGhostMarker.css('left', `${curPercentage}%`);
        }

        const moment = this.session.timeline.currentMoments[momentToQuery];

        const bufferStatus = 
            moment.bufferProgression == 0 ? 'Not Buffered' :
            moment.bufferProgression == 1 ? 'Interpolated' :
            moment.bufferProgression == 2 ? 'Buffered' : 'ERROR';
        this._tlMomentName.html(`
            <span><i class="bi-alarm icon-left"></i>${DateUtils.to_DDMMYYYY_HHMMSS(moment.date)}</span>
            <span><i class="bi-bar-chart icon-left"></i>${moment.avgDataValue.toFixed(2)}</span>
            <span><i class="bi-memory icon-left"></i>${bufferStatus}</span>`
        );
    }

    updateBufferIndicators() {
        const bufferStart = this.getMomentOffsetPercentage(this._bufferBounds.x);
        const bufferEnd = this.getMomentOffsetPercentage(this._bufferBounds.y);

        const colorStart = this.getMomentOffsetPercentage(this._colorBounds.x);
        const colorEnd = this.getMomentOffsetPercentage(this._colorBounds.y);

        this._tlBufferBar.css('left', `${bufferStart}%`).css('width', `${bufferEnd - bufferStart}%`);
        this._tlColorBar.css('left', `${colorStart}%`).css('width', `${colorEnd - colorStart}%`);
    }

    updateForSelectedStations() {
        const session = visualizer.session;
        if (!session) return;
        
        if (session.selectedStations.length == 0) {
            this.setActivePanel(this._noStationsPanel);
            return;
        }

        if (!session.timeline.isRangeCovered(session.startDate, session.endDate, session.selectedStations.map(x => x.station_id))) {
            this.setActivePanel(this._needFetchPanel);
            return;
        }

        session.timeline.updateSelectedStations(session.selectedStations.map(s => s.station_id));
        this.constructMomentValueIndicators();
        this.setActivePanel(this._timelinePanel);
        this.updateBufferIndicators();
        this.updateCurrentMomentMarkerAndInfo();
    }

    private constructMomentValueIndicators() {
        const session = visualizer.session;
        if (!session) return;

        const width = moment2DCanvas.canvas.getBoundingClientRect().width;
        const height = moment2DCanvas.canvas.getBoundingClientRect().height;

        // For some reason the canvas stays at 0,0 for the first run
        if (width == 0 && height == 0) {
            setTimeout(() => this.constructMomentValueIndicators(), 1000);
        }

        moment2DCanvas.canvas.width = width;
        moment2DCanvas.canvas.height = height;

        const stepX = Math.round(width / session.timeline.currentMoments.length);

        moment2DCanvas.clearRect(0, 0, width, height);
        const path = new Path2D();
        path.moveTo(0, height);

        MUtils.normalizeListMinMax(session.timeline.currentMoments.map(m => m.avgDataValue)).forEach((m, i) => {
            const y = height - Math.round(m * height);
            path.lineTo(stepX * i, y);
        });

        path.lineTo(width, height);
        path.closePath();
        
        moment2DCanvas.fillStyle = '#555';
        moment2DCanvas.fill(path);
        
    }

    fetchIPP() {
        const session = visualizer.session;
        if (!session) return;

        visualizer.api.fetchIPP({
            startDate: session.startDate,
            endDate: session.endDate,
            ion: 350,
            satellites: 'GPS',
            stations: session.selectedStations.map(x => x.station_id)
        })
        .then(t => {
            session.addIPP(t.map(ipp => {
                ipp.id = parseInt(`${ipp.id}`);
                ipp.value = parseFloat(`${ipp.value}`);
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

    private get session() {
        return visualizer.session as ISMRSession;
    }

    private get ippSphere() {
        return visualizer.universeScene.ippSphere;
    }

    get speed() {
        const valStr = this._tlPlayIntervalSelect.val() as string || "";
        try {
            return Number.parseInt(valStr);
        } catch (e) {
            console.warn(e);
        }
        return 1000;
    }

    set speed(s: number) {
        const speedChildren = $('#tl-play-interval option');
        const matches = speedChildren.removeAttr('selected').filter(`[value=${s}]`);
        if (matches.length == 0) {
            speedChildren.filter(`[value=1000]`).prop('selected', true);
        } else {
            matches.prop('selected', true);
        }
        this._playInterval = s;
    }

    get ippOpacity() {
        return this._opacityControl.val() as number;
    }

    set ippOpacity(opacity: number) {
        if (opacity < 0 || opacity > 1) {
            console.warn('Trying to set an invalid opacity value: ' + opacity);
            return;
        }
        this._opacityControl.val(opacity);
        visualizer.universeScene.ippSphere.opacity = opacity;
        const labelValue = (opacity * 100).toFixed(0);
        this._opacityLabel.html(`${labelValue}%`);
    }

    get currentIndex() {
        return this._activeMoment;
    }

    set currentIndex(i: number) {
        this._activeMoment = i;
        this.updateCurrentMomentMarkerAndInfo();
    }

}