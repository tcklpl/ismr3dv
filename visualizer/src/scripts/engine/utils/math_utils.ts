import { Vec3 } from "../data_formats/vec/vec3";

export class MUtils {

    static degToRad(deg: number) {
        return deg * Math.PI / 180;
    }

    static clamp(min: number, max: number, value: number) {
        return (value >= max) ? max : ((value <= min) ? min : value);
    }

    static isBetween(min: number, max: number, value: number) {
        return min <= value && value <= max;
    }

    static normalize(min: number, max: number, value: number) {
        let amplitude = max - min;
        return (value - min) / amplitude;
    }

    static latLonToWorld(lat: number, lon: number, alt: number, radius: number) {
        const f = 0;
        const ls = Math.atan((1 - f) * (1 - f) * Math.tan(lat));

        const x = radius * Math.cos(ls) * Math.cos(lon) + alt * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.cos(ls) * Math.sin(lon) + alt * Math.cos(lat) * Math.sin(lon);
        const z = radius * Math.sin(ls) + alt * Math.sin(lat);

        return new Vec3(x, y, z);
    }
}