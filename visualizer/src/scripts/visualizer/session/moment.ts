import { IIPPInfo } from "../api/formats/i_ipp_info";
import { MUtils } from "../../engine/utils/math_utils";
import { TextureUtils } from "../../engine/utils/texture_utils";
import { Visualizer } from "../visualizer";

/**
 *  Moment class, it's meant to hold a specified time and all its IPP readings
 */
export class Moment {
    
    private _time: number; // time without seconds in UTC (divided by 100000)
    private _date: Date;
    private _data: IIPPInfo[];
    private _buffer: WebGLTexture;

    constructor(time: number, data: IIPPInfo[]) {
        this._time = time;
        this._date = new Date(time * 100000);
        this._data = data;
        const buf = new Float32Array(data.flatMap(x => {
            const ll = MUtils.normalizedLatLong(x.lat, x.long);
            return [ll.y, ll.x, x.value];
        }));
        this._buffer = TextureUtils.create1DVec3TextureFromBuffer(Visualizer.instance.gl, buf);
    }

    freeBuffer() {
        Visualizer.instance.gl.deleteTexture(this._buffer);
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

    get buffer() {
        return this._buffer;
    }

}