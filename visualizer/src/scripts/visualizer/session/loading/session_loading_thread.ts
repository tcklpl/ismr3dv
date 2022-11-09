import { IIPPInfo } from "../../api/formats/i_ipp_info";
import { IMomentIPPMeasurements } from "../moments/moment";

export const sessionLoadingThread = () => {

    const con = self.indexedDB.open('ismr', 4);
    
    self.onmessage = async e => {
        const req = e.data as ISessionLoadingThreadRequest;

        switch (req.key) {
            case 'idbKey':
                const os = con.result.transaction('session-ipp', 'readonly').objectStore('session-ipp');
                const res = os.get(req.idbKey as string);
                res.onsuccess = () => loadRawIPP(res.result.raw_ipp as IIPPInfo[]);
                break;
            case 'rawIPP':
                loadRawIPP(req.rawIPP as IIPPInfo[]);
                break;
        }
        
    }

    const loadRawIPP = (o: IIPPInfo[]) => {
        const ippByDate = new Map<number, IIPPInfo[]>();

        // 1 - Separate by date
        o.forEach(ipp => {
            const date = getTimeFromIPP(ipp) / 100000;
            const res = ippByDate.get(date);
            if (res) {
                res.push(ipp);
            } else {
                ippByDate.set(date, [ ipp ]);
            }
        });

        // 2 - Send the number of moments (to set the loading bar max)
        self.postMessage(<ISessionLoadingThreadResponse>{
            key: 'count',
            body: ippByDate.size
        });

        // 3 - Construct the moments
        if (ippByDate.size > 0) {
            ippByDate.forEach((v, k) => constructMoment(k, v));
        } else {
            // send 'empty' message if there's nothing to load
            self.postMessage(<ISessionLoadingThreadResponse>{
                key: 'empty',
                body: 0
            });
        }

    }

    const constructMoment = (time: number, ippList: IIPPInfo[]) => {
        
        const ippMeasurements: IMomentIPPMeasurements = {
            min: ippList[0].value,
            max: ippList[0].value,
            avg: 0,
            med: 0
        };

        // Ordered list to insert all the ipp values, this list is ordered in order to get the median
        const orderedList: number[] = [];
        // Function to insert values on the list above
        const insertOrdered = (v: number) => {
            let pos = 0;
            for (let i = 0; i < orderedList.length; i++) {
                if (i <= orderedList.length - 2) {
                    if (orderedList[i] <= v && orderedList[i + 1] >= v) {
                        pos = i + 1;
                        break;
                    }
                } else if (orderedList[i] <= v) {
                    pos = i + 1;
                }
            }
            orderedList.splice(pos, 0, v);
        };

        // Function to get the median from the list above, this is separated here to make the code cleaner down there
        const getOrderedMedian = () => {
            if (orderedList.length & 1) {
                return orderedList[Math.floor(orderedList.length / 2)];
            } else {
                return (orderedList[orderedList.length / 2] + orderedList[orderedList.length / 2 + 1]) / 2;
            }
        };
        
        // Satellite coordinates (lat and long), these will be used to estimate the satellite's position
        const satCoords = new Map<string, {lat: number, long: number}[]>();

        // Satellite IPP values, this is a temporary map that will eventually be reduced into '_ippPerSatellite'
        const satIpp = new Map<string, number[]>();

        ippList.forEach(d => {
            // Get measurements for min, max, avg and median
            if (d.value < ippMeasurements.min) ippMeasurements.min = d.value;
            else if (d.value > ippMeasurements.max) ippMeasurements.max = d.value;

            ippMeasurements.avg += d.value;
            insertOrdered(d.value);

            // Insert the satellite's position in the list
            const satObj = {lat: d.lat, long: d.long};
            if (satCoords.has(d.svid)) satCoords.get(d.svid)?.push(satObj);
            else satCoords.set(d.svid, [satObj]);

            // Insert the satellite's IPP in the list
            if (satIpp.has(d.svid)) satIpp.get(d.svid)?.push(d.value);
            else satIpp.set(d.svid, [d.value]);
        });

        // Divide the values for the avg and the median
        ippMeasurements.avg /= ippList.length;
        ippMeasurements.med = getOrderedMedian();

        // Now construct each satellite position using the average of the points provided and set it's coords as the translation of lat
        // and long to unit spehere coordinates
        const finalSatelliteCoords = new Map<string, {x: number, y: number, z: number}>();
        satCoords.forEach((v, k) => {
            const sumValues = v.reduce((prev, cur) => {
                prev.lat += cur.lat;
                prev.long += cur.long;
                return prev;
            }, {lat: 0, long: 0});
            sumValues.lat /= v.length;
            sumValues.long /= v.length;

            finalSatelliteCoords.set(k, latLongToUnitSphere(sumValues.lat, sumValues.long));
        });

        // And reduce the ipp values per satellite
        const ippPerSatellite = new Map<string, number>();
        satIpp.forEach((v, k) => {
            const avg = v.reduce((prev, cur) => prev += cur, 0) / v.length;
            ippPerSatellite.set(k, avg);
        });

        // Now send everything back
        self.postMessage(<ISessionLoadingThreadResponse> {
            key: 'moment',
            body: {
                time: time,
                ipp: ippList,
                ippPerSatellite: ippPerSatellite,
                measurements: ippMeasurements,
                satelliteCoords: finalSatelliteCoords
            }
        });
    }
    
    const getTimeFromIPP = (ipp: IIPPInfo) => {
        // time_utc comes as "2014-09-01 22:00:00" (UTC)
        const regex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
        const matches = regex.exec(ipp.time_utc);
        if (!matches || matches.length < 7) {
            console.warn(`BAD IPP TIME UTC: ${ipp.time_utc}`);
            return -1;
        }
        return Date.UTC(parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3]), parseInt(matches[4]), parseInt(matches[5]), parseInt(matches[6]));
    }

    const latLongToUnitSphere = (latitudeDeg: number, longitudeDeg: number) => {
        const phi = degToRad(90 - latitudeDeg);
        const theta = degToRad(longitudeDeg + 0);

        const x = -(Math.sin(phi) * Math.cos(theta));
        const z = Math.sin(phi) * Math.sin(theta);
        const y = Math.cos(phi);

        return {x: x, y: y, z: z};
    }

    const degToRad = (deg: number) => {
        return deg * Math.PI / 180;
    }
};

export interface ISessionLoadingThreadRequest {
    key: 'idbKey' | 'rawIPP';
    idbKey?: string;
    rawIPP?: IIPPInfo[];
}

export interface ISessionLoadingThreadResponse {
    key: 'count' | 'moment' | 'empty';
    body: number | IMomentCalculatedInfo;
}

export interface IMomentCalculatedInfo {
    time: number;
    ipp: IIPPInfo[];
    measurements: IMomentIPPMeasurements;
    ippPerSatellite: Map<string, number>;
    satelliteCoords: Map<string, {x: number, y: number, z: number}>;
}
