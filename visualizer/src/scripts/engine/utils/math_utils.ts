import { Vec3 } from "../data_formats/vec/vec3";

export class MUtils {

    static degToRad(deg: number) {
        return deg * Math.PI / 180;
    }

    static radToDeg(rad: number) {
        return rad * 180 / Math.PI;
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

    static latLongToUnitSphere(latitudeDeg: number, longitudeDeg: number) {
        const phi = this.degToRad(90 - latitudeDeg);
        const theta = this.degToRad(longitudeDeg + 0);

        const x = -(Math.sin(phi) * Math.cos(theta));
        const z = Math.sin(phi) * Math.sin(theta);
        const y = Math.cos(phi);

        return new Vec3(x, y, z);
    }

    static pointToAnglesToOrigin(loc: Vec3, origin: Vec3 = Vec3.fromValue(0)) {
        const gamma = Math.atan(Math.sqrt( ( (loc.x - origin.x)**2 + (loc.y - origin.y)**2 ) / (loc.z - origin.z) ));
        const alpha = Math.atan(Math.sqrt( ( (loc.z - origin.z)**2 + (loc.y - origin.y)**2 ) / (loc.x - origin.x) ));
        const beta = Math.atan(Math.sqrt( ( (loc.x - origin.x)**2 + (loc.z - origin.z)**2 ) / (loc.y - origin.y) ));

        return new Vec3(this.radToDeg(alpha), this.radToDeg(beta), this.radToDeg(gamma));
    }
}