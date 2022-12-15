import { MessageScreen } from "../../ui/message_screen";
import { IISMRFilter } from "./filters/filter_list";

export class IPPFetcher {

    fetchData(ion: number, targetField: IISMRFilter, satellites: string, cb?: () => void) {
        const session = visualizer.session;
        if (!session) return;

        visualizer.api.fetchIPP({
            startDate: session.startDate,
            endDate: session.endDate,
            ion: ion,
            satellites: satellites,
            stations: session.selectedStations.map(x => x.station_id),
            filter: visualizer.ui.dataFetcher.filterManager.filtersAsString,
            field: targetField.name
        })
        .then(t => {
            const ipp = t.map(ipp => {
                ipp.id = parseInt(`${ipp.id}`);
                ipp.value = parseFloat(`${ipp.value}`);
                return ipp;
            });

            visualizer.sessionLoader.constructIPPForCurrentSession(ipp, () => {
                session.timeline.bufferAvailableMoments();
                session.instantiateSatellitesAs3dObjects();
                visualizer.events.dispatchEvent('new-ipp-data');
            });
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