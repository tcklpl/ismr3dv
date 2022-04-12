import { IStationInfo } from "../api/formats/i_station_info";
import { CacheProvider } from "./cache_provider";
import { IntervalAvailability } from "./interval_availability";
import { TimedCacheKey } from "./timed_cache_key";

export class StationListCacheProvider extends CacheProvider<IStationInfo, TimedCacheKey> {

    private _cacheMergeBias = 2/3;

    constructor() {
        super('sta');
    }

    protected parseKeyedString(str: string): TimedCacheKey {
        let parts = str.split("|");
        if (parts.length != 2) throw `Invalid sation list cache key`;
        return new TimedCacheKey(new Date(parts[0]), new Date(parts[1]));
    }

    queryInterval(start: Date, end: Date): {availability: IntervalAvailability, value?: IStationInfo[], uncoveredIntervalStart?: Date, uncoveredIntervalEnd?: Date} {

        const totalSubjects: {key: TimedCacheKey, values: IStationInfo[]}[] = [];
        const partialSubjects: {key: TimedCacheKey, values: IStationInfo[]}[] = [];

        this.cachedData.forEach((v, k) => {

            const comprehendsStart = k.comprehendsDate(start);
            const comprehendsEnd = k.comprehendsDate(end);

            if (comprehendsStart && comprehendsEnd) {
                totalSubjects.push({
                    key: k,
                    values: v
                });
            } else if (comprehendsStart || comprehendsEnd) {
                partialSubjects.push({
                    key: k,
                    values: v
                });
            }

        });

        const mergedStationList: IStationInfo[] = [];
        const stationOcurrences: Map<IStationInfo, number> = new Map();

        if (totalSubjects.length > 0) {

            totalSubjects.forEach(s => {
                s.values.forEach(v => {
                    let alreadyOnList = stationOcurrences.get(v) ?? 0;
                    stationOcurrences.set(v, alreadyOnList + 1);
                });
            });

            stationOcurrences.forEach((v, k) => {
                console.log(`${v} vs ${totalSubjects.length * this._cacheMergeBias}`);
                if (v >= totalSubjects.length * this._cacheMergeBias) mergedStationList.push(k);
            });

            return {
                availability: IntervalAvailability.TOTAL,
                value: mergedStationList
            };
        }

        if (partialSubjects.length == 0) return {
            availability: IntervalAvailability.NONE
        };

        let curStart = start;
        let curEnd = end;
        let curValues: IStationInfo[][] = [];
        let fullCoverage = false;

        console.log(`${partialSubjects.length} partial subjects`);

        for (let s of partialSubjects) {
            
            curValues.push(s.values);

            if (s.key.comprehendsDate(curStart)) {
                curStart = s.key.end;
            } else if (s.key.comprehendsDate(curEnd)) {
                curEnd = s.key.start;
            }

            if (curStart.getTime() >= curEnd.getTime()) {
                fullCoverage = true;
                break;
            }
        }

        if (fullCoverage) {
            return {
                availability: IntervalAvailability.TOTAL,
                value: curValues.flat().filter((v, i, a) => a.indexOf(v) == i)
            }
        } else {
            return {
                availability: IntervalAvailability.PARTIAL,
                value: curValues.flat().filter((v, i, a) => a.indexOf(v) == i),
                uncoveredIntervalStart: curStart,
                uncoveredIntervalEnd: curEnd
            }
        }
    }

    register(start: Date, end: Date, value: IStationInfo[]) {
        this.cache(new TimedCacheKey(start, end), value);
    }
}