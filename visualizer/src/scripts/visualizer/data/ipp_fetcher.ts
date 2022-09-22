import { MessageScreen } from "../../ui/message_screen";

export class IPPFetcher {

    fetchData(ion: number, satellites: string, cb?: () => void) {
        const session = visualizer.session;
        if (!session) return;
        console.log(session);

        visualizer.api.fetchIPP({
            startDate: session.startDate,
            endDate: session.endDate,
            ion: ion,
            satellites: satellites,
            stations: session.selectedStations.map(x => x.station_id),
            filter: visualizer.ui.dataFetcher.filterManager.filtersAsString,
            field: 's4'
        })
        .then(t => {
            session.addIPP(t.map(ipp => {
                ipp.id = parseInt(`${ipp.id}`);
                ipp.value = parseFloat(`${ipp.value}`);
                return ipp;
            }));
            visualizer.events.dispatchEvent('new-ipp-data');
        })
        .catch(err => {
            new MessageScreen('Error', 'There was an error while fetching the requested data, does it exist? is your connection ok?');
            visualizer.events.dispatchEvent('ipp-fetch-error');
            console.log(err);
        })
        .finally(() => {
            if (cb) cb();
        });
    }
    
}