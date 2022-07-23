import { ISMRSession } from "../visualizer/session/ismr_session";
import { RandomUtils } from "../visualizer/utils/random_utils";
import { IUI } from "./i_ui";
import { MessageScreen } from "./message_screen";

export class UITimeline implements IUI {

    private _container = $('#timeline-container');

    private _noStationsPanel = $('#timeline-no-stations');

    private _needFetchPanel = $('#timeline-need-fetch');
    private _needFetchBtn = $('#timeline-btn-fetch');
    private _fetchingPanel = $('#timeline-fetching');

    private _timelinePanel = $('#timeline-panel');
    private _timelineKeyframesUl = $('#timeline-keyframes');
    private _timelineChildren: JQuery<HTMLElement>[] = [];
    private _tlMomentName = $('#tl-cur-name');

    private _tlBtnFirst = $('#tl-btn-first');
    private _tlBtnPrev = $('#tl-btn-prev');
    private _tlBtnNext = $('#tl-btn-next');
    private _tlBtnLast = $('#tl-btn-last');
    private _tlMomentCounter = $('#tl-cur-number');
    private _tlDisplayMaxMoments = $('#tl-max-number');

    private _activeMoment = 0;

    private setActivePanel(panel: JQuery<HTMLElement>) {
        this._container.children().removeClass('d-flex show').addClass('d-none');
        panel.removeClass('d-none').addClass('d-flex show');
    }

    registerEvents() {
        this._needFetchBtn.on('click', () => {
            this.setActivePanel(this._fetchingPanel);
            this.fetchIPP();
        });

        this._tlBtnFirst.on('click', () => this.setMoment(0));
        this._tlBtnPrev.on('click', () => this.previousMoment());
        this._tlBtnNext.on('click', () => this.nextMoment());
        this._tlBtnLast.on('click', () => this.setMoment(this.session.timeline.currentMoments.length - 1));
        this._tlMomentCounter.on('change', () => this.setMoment(this._tlMomentCounter.val() as number - 1));
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
        this.constructKeyframes();
        this._tlMomentCounter.prop('max', session.timeline.currentMoments.length);
        this._tlDisplayMaxMoments.html(`/ ${session.timeline.currentMoments.length}`);
        this.setActivePanel(this._timelinePanel);
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

    private updateInterfaceToMoment() {
        const backwardsDisabled = this._activeMoment == 0;
        const forwardsDisabled = this._activeMoment == this.session.timeline.currentMoments.length - 1;
        this._tlBtnFirst.prop('disabled', backwardsDisabled);
        this._tlBtnPrev.prop('disabled', backwardsDisabled);
        this._tlBtnNext.prop('disabled', forwardsDisabled);
        this._tlBtnLast.prop('disabled', forwardsDisabled);
        this._tlMomentCounter.val(this._activeMoment + 1);
        this._tlMomentName.html(this.session.timeline.currentMoments[this._activeMoment].date.toLocaleString());
    }

    setMoment(i: number) {
        if (i > this.session.timeline.currentMoments.length - 1 || i < 0) return;
        this.setActiveMoment(i);
        this.ippSphere.currentTexture = this.session.timeline.buffer.setMomentByIndex(i);
        this.ippSphere.currentChannel = this._activeMoment % 4;
    }

    nextMoment() {
        if (this._activeMoment >= this.session.timeline.currentMoments.length - 1) return;
        this.setActiveMoment(this._activeMoment + 1);
        this.ippSphere.currentTexture = this.session.timeline.buffer.nextMoment();
        this.ippSphere.currentChannel = this._activeMoment % 4;
    }

    previousMoment() {
        if (this._activeMoment <= 0) return;
        this.setActiveMoment(this._activeMoment - 1);
        this.ippSphere.currentTexture = this.session.timeline.buffer.previousMoment();
        this.ippSphere.currentChannel = this._activeMoment % 4;
    }

    setActiveMoment(index: number) {
        this._timelineChildren[this._activeMoment].removeClass('active');
        this._activeMoment = index;
        this._timelineChildren[index].addClass('active');

        this._timelineChildren.forEach(c => c.removeClass('buffered same-buffer'));
        const startI = Math.floor(index / 4) * 4;
        for (let i = Math.max(0, startI - 8); i <= Math.min(this.session.timeline.currentMoments.length - 1, startI + 11); i++) {
            if (!this._timelineChildren[i].hasClass('active')) {
                this._timelineChildren[i].addClass(i >= startI && i < startI + 4 ? 'same-buffer' : 'buffered');
            }
        }
        this._timelineChildren[index][0].scrollIntoView(true);
        this.updateInterfaceToMoment();
    }

    constructKeyframes() {
        this._timelineKeyframesUl.empty();

        this.session.timeline.currentMoments.forEach((m, i) => {
            const id = `tlid-${RandomUtils.randomString(10)}`;
            const src = `<li id="${id}"></li>`;
            const html = $.parseHTML(src);
            $(html).on('click', () => this.setMoment(i));
            $(html).on('mouseover', () => {
                this._tlMomentName.html(m.date.toLocaleString());
                this._tlMomentCounter.val(i + 1);
            });
            $(html).on('mouseleave', () => this.updateInterfaceToMoment());
            this._timelineKeyframesUl.append(html);
            this._timelineChildren.push($(`#${id}`));
        });
        this.setActiveMoment(0);
    }

    private get session() {
        return visualizer.session as ISMRSession;
    }

    private get ippSphere() {
        return visualizer.universeScene.ippSphere;
    }

}