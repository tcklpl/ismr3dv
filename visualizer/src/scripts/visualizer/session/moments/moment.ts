import { Vec2 } from "../../../engine/data_formats/vec/vec2";
import { Vec3 } from "../../../engine/data_formats/vec/vec3";
import { MUtils } from "../../../engine/utils/math_utils";
import { IIPPInfo } from "../../api/formats/i_ipp_info";

interface IMomentInterpolatedData {
    size: Vec2;
    data: Float32Array;
}

interface IMomentImageData {
    size: Vec2;
    data: Uint8Array;
}

interface IMomentIPPMeasurements {
    min: number;
    avg: number;
    max: number;
    med: number;
}

/**
 *  Moment class, it's meant to hold a specified time and all its IPP readings
 */
export class Moment {
    
    private _time: number; // time without seconds in UTC (divided by 100000)
    private _date: Date;
    private _data: IIPPInfo[];
    bufferInterpolatedData?: IMomentInterpolatedData;
    bufferColoredData?: IMomentImageData;

    private _ippMeasurements: IMomentIPPMeasurements;
    private _ippPerSatellite = new Map<string, number>();
    private _satellitesCoords = new Map<string, Vec3>();

    constructor(time: number, data: IIPPInfo[]) {
        this._time = time;
        this._date = new Date(time * 100000);
        this._data = data;

        // First, initialize all the measurements
        this._ippMeasurements = {
            min: data[0].value,
            max: data[0].value,
            avg: 0,
            med: 0
        }

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

        // Now, reading all the data...
        data.forEach(d => {
            // Get measurements for min, max, avg and median
            if (d.value < this._ippMeasurements.min) this._ippMeasurements.min = d.value;
            else if (d.value > this._ippMeasurements.max) this._ippMeasurements.max = d.value;

            this._ippMeasurements.avg += d.value;
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
        this._ippMeasurements.avg /= data.length;
        this._ippMeasurements.med = getOrderedMedian();

        // Now construct each satellite position using the average of the points provided and set it's coords as the translation of lat
        // and long to unit spehere coordinates
        satCoords.forEach((v, k) => {
            const sumValues = v.reduce((prev, cur) => {
                prev.lat += cur.lat;
                prev.long += cur.long;
                return prev;
            }, {lat: 0, long: 0});
            sumValues.lat /= v.length;
            sumValues.long /= v.length;

            this._satellitesCoords.set(k, MUtils.latLongToUnitSphere(sumValues.lat, sumValues.long));
        });

        // And reduce the ipp values per satellite
        satIpp.forEach((v, k) => {
            const avg = v.reduce((prev, cur) => prev += cur, 0) / v.length;
            this._ippPerSatellite.set(k, avg);
        });
    }
    
    /**
     * Replaces the current framebuffer texture.
     * 
     * (( THIS FUNCTION REQUIRES INTERPOLATED AND COLORED DATA ))
     * 
     * This function will be called when changing the active moment, in order to replace the current texture that will be
     * rendered onto the IPP sphere.
     * @returns void
     */
    texSubCurrent() {
        if (!this.bufferColoredData) {
            console.warn('Trying to subtex moment with no image data!');
            return;
        }
        const size = this.bufferColoredData?.size as Vec2;
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, size.x, size.y, gl.RGBA, gl.UNSIGNED_BYTE, this.bufferColoredData.data);
    }

    /**
     * Removes the reference to the moment's data. As we cannot directly free the memory, this should make the GC be able
     * to see it as unreferenced and free it.
     */
    clearInterpAndColorData() {
        this.bufferColoredData = undefined;
        this.bufferInterpolatedData = undefined;
    }

    get time() {
        return this._time;
    }

    get date() {
        return this._date;
    }

    get data() {
        return this._data;
    }

    get bufferProgression() {
        let res = 0;
        if (this.bufferInterpolatedData) res++;
        if (this.bufferColoredData) res++;
        return res;
    }

    get hasImageData() {
        return !!this.bufferColoredData;
    }

    get ippMeasurements() {
        return this._ippMeasurements;
    }

    get satellitesCoords() {
        return this._satellitesCoords;
    }

    get ippPerSatellite() {
        return this._ippPerSatellite;
    }

}