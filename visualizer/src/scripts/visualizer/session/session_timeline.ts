import { IIPPInfo } from "../api/formats/i_ipp_info";

export class SessionTimeline {
    
    private _ippInfoList: IIPPInfo[] = [];
    private _ippByDate: Map<number, IIPPInfo[]> = new Map(); // number is Date#getTime() / 100000. Cannot use Date object for comparisions
    private _coveredStations: number[] = [];

    constructor() {        
    }

    addIPP(list: IIPPInfo[]) {
        const filteredList = list.filter(x => !this._ippInfoList.includes(x));
        console.log(filteredList);
        filteredList.forEach(ipp => {
            // time_utc comes as "2014-09-01 22:00:00" (UTC)
            const regex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
            const matches = regex.exec(ipp.time_utc);

            if (!matches || matches.length < 7) {
                console.warn(`BAD IPP TIME UTC: ${ipp.time_utc}`);
            } else {
                const date = Date.UTC(parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3]), parseInt(matches[4]), parseInt(matches[5]), parseInt(matches[6]));
                let toInsert = this._ippByDate.get(Math.floor(date / 100000));
                if (!toInsert) {
                    toInsert = [];
                    this._ippByDate.set(Math.floor(date / 100000), toInsert);
                }
                toInsert.push(ipp);
                this._ippInfoList.push(ipp);
                if (!this._coveredStations.includes(ipp.id))
                    this._coveredStations.push(ipp.id);
            }
            
        });
    }

    isRangeCovered(start: Date, end: Date, stations: number[]) {
        const startTime = Math.floor(start.getTime() / 100000);
        const endTime = Math.floor(end.getTime() / 100000);

        for (let i = startTime; i <= endTime; i++) {
            const timeIPP = this._ippByDate.get(i);
            if (!timeIPP) {
                return false;
            }
        }

        if (stations.find(x => !this._coveredStations.includes(Math.floor(x)))) {
            return false;   
        }

        return true;
    }

    get coverage() {
        return [...this._ippByDate.keys()];
    }

    get ippList() {
        return this._ippInfoList;
    }

}