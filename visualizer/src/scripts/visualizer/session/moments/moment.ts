import { Vec2 } from "../../../engine/data_formats/vec/vec2";
import { Vec3 } from "../../../engine/data_formats/vec/vec3";
import { MUtils } from "../../../engine/utils/math_utils";
import { IIPPInfo } from "../../api/formats/i_ipp_info";
import { IMomentCalculatedInfo } from "../loading/session_loading_thread";

interface IMomentInterpolatedData {
    size: Vec2;
    data: Float32Array;
}

interface IMomentImageData {
    size: Vec2;
    data: Uint8Array;
}

export interface IMomentIPPMeasurements {
    min: number;
    avg: number;
    max: number;
    med: number;
}

/**
 *  Moment class, it's meant to hold a specified time and all its IPP readings
 */
export class Moment {
    
    private _date: Date;
    private _data: IIPPInfo[];
    bufferInterpolatedData?: IMomentInterpolatedData;
    bufferColoredData?: IMomentImageData;

    private _ippMeasurements: IMomentIPPMeasurements;
    private _ippPerSatellite: Map<string, number>;
    private _satellitesCoords: Map<string, Vec3>;

    constructor(info: IMomentCalculatedInfo) {
        this._date = new Date(info.time * 100000);
        this._data = info.ipp;
        this._ippMeasurements = info.measurements;
        this._ippPerSatellite = info.ippPerSatellite;
        this._satellitesCoords = new Map();
        info.satelliteCoords.forEach((v, k) => {
            this._satellitesCoords.set(k, new Vec3(v.x, v.y, v.z));
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