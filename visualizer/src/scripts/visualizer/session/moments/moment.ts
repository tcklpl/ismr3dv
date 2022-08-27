import { Vec2 } from "../../../engine/data_formats/vec/vec2";
import { IIPPInfo } from "../../api/formats/i_ipp_info";

interface IMomentInterpolatedData {
    size: Vec2;
    data: Float32Array;
}

interface IMomentImageData {
    size: Vec2;
    data: Uint8Array;
}

/**
 *  Moment class, it's meant to hold a specified time and all its IPP readings
 */
export class Moment {
    
    private _time: number; // time without seconds in UTC (divided by 100000)
    private _date: Date;
    private _data: IIPPInfo[];
    private _avgDataValue: number;
    bufferInterpolatedData?: IMomentInterpolatedData;
    bufferColoredData?: IMomentImageData;

    constructor(time: number, data: IIPPInfo[]) {
        this._time = time;
        this._date = new Date(time * 100000);
        this._data = data;
        this._avgDataValue = data.reduce((prev, cur) => prev += cur.value, 0) / data.length;
    }

    texSubCurrent() {
        if (!this.bufferColoredData) {
            console.warn('Trying to subtex moment with no image data!');
            return;
        }
        const size = this.bufferColoredData?.size as Vec2;
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, size.x, size.y, gl.RGBA, gl.UNSIGNED_BYTE, this.bufferColoredData.data);
    }

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

    get avgDataValue() {
        return this._avgDataValue;
    }

}