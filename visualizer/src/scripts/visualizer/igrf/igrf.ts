import { EngineError } from "../../engine/errors/engine_error";
import { MUtils } from "../../engine/utils/math_utils";
import { IGRFModelCoeffs, IIGRFTableEntry } from "./igrf_model_coeffs";

export class IGRFModel {

    private _earthRadius = 6371.2;
    private _n = 13;
    private _coeffs: IGRFModelCoeffs;

    constructor(coeffs: IGRFModelCoeffs) {
        this._coeffs = coeffs;
        this.calculateAtLatLongRYr(40, 50, 3900, 2000);
    }

    private calculatePnmAndDerivatives(thetaRadians: number) {
        const Pnm: number[][] = new Array(this._n + 1).fill(0).map(() => new Array(this._n + 2).fill(0));

        const cosTheta = Math.cos(thetaRadians);
        const sinTheta = Math.sqrt(1 - cosTheta**2);

        const rootN = Array.from(Array(this._n**2 * 2 + 1).keys()).map(v => Math.sqrt(v));

        Pnm[0][0] = 1;
        Pnm[1][1] = sinTheta;

        for (let m = 0; m < this._n; m++) {
            const PnmTmp = rootN[m + m + 1] * Pnm[m][m];
            Pnm[m + 1][m] = cosTheta * PnmTmp;

            if (m > 0) Pnm[m + 1][m + 1] = sinTheta * PnmTmp / rootN[m + m + 2];

            for (let n = m + 2; n <= this._n; n++) {
                const d = n * n - m * m;
                const e = n + n - 1;
                Pnm[n][m] = ((e * cosTheta * Pnm[n - 1][m] - rootN[d - e] * Pnm[n - 2][m]) / rootN[d]);
            }
        }

        Pnm[0][2] = -Pnm[1][1];
        Pnm[1][2] = Pnm[1][0];

        for (let n = 2; n <= this._n; n++) {
            Pnm[0][n + 1] = -Math.sqrt((n * n + n) / 2) * Pnm[n][1];
            Pnm[1][n + 1] = ((Math.sqrt(2 * (n * n + n)) * Pnm[n][0] - Math.sqrt(n * n + n - 2) * Pnm[n][2]) / 2);

            for (let m = 2; m < n; m++) {
                Pnm[m][n + 1] = (0.5 * (Math.sqrt((n + m) * (n - m + 1)) * Pnm[n][m - 1] - Math.sqrt((n + m + 1) * (n - m)) * Pnm[n][m + 1]));
            }

            Pnm[n][n + 1] = Math.sqrt(2 * n) * Pnm[n][n - 1] / 2;
        }

        return { Pnm: Pnm };
    }

    private calculatePartialDerivatives(thetaRadians: number, phiRadians: number, year: number, r: number) {
        // Br, Bt(heta) and Bp(hi) are the partial derivatives by r, theta and phi
        let Bradius = 0, Btheta = 0, Bphi = 0;

        const radius = r / this._earthRadius;

        let rN = radius**(-3); // -3 = -(nmin + 2)
        const { Pnm } = this.calculatePnmAndDerivatives(thetaRadians);

        const sinTheta = Pnm[1][1];

        const cosPhiList = Array.from(Array(this._n + 1).keys()).map(v => v * phiRadians).map(v => Math.cos(v));
        const sinPhiList = Array.from(Array(this._n + 1).keys()).map(v => v * phiRadians).map(v => Math.sin(v));

        let num = 1**2 - 1;
        const coeffs = this.flatGHByYear(year);

        for (let n = 1; n <= this._n; n++) {
            Bradius += (n + 1) * Pnm[n][0] * rN * coeffs[num];
            Btheta += -Pnm[0][n + 1] * rN * coeffs[num];

            num++;

            for (let m = 1; m <= n; m++) {
                Bradius += ((n + 1) * Pnm[n][m] * rN * (coeffs[num] * cosPhiList[m] + coeffs[num + 1] * sinPhiList[m]));
                Btheta += (-Pnm[m][n + 1] * rN * (coeffs[num] * cosPhiList[m] + coeffs[num + 1] * sinPhiList[m]));

                let divPnm = thetaRadians == 0 ? Pnm[m][n + 1] : Pnm[n][m] / sinTheta;
                divPnm = thetaRadians == Math.PI ? -Pnm[m][n + 1] : divPnm;

                Bphi += (m * divPnm * rN * (coeffs[num] * sinPhiList[m] - coeffs[num + 1] * cosPhiList[m]));

                num += 2;
            }

            rN /= radius;

        }

        return { Br: Bradius, Bt: Btheta, Bp: Bphi };
    }

    private calculateNonLinearComponents(x: number, y: number, z: number) {

        const hsq = x*x + y*y;
        const horizontal = Math.sqrt(hsq);
        const totalIntensity = Math.sqrt(hsq + z*z);
        const declination = Math.atan2(y, x);
        const inclination = Math.atan2(z, horizontal);

        return { declination: MUtils.radToDeg(declination), horizontal: horizontal, inclination: MUtils.radToDeg(inclination), totalIntensity: totalIntensity };
    }

    private flatGHByYear(y: number) {
        const lastYear = (this._coeffs.entries[this._coeffs.entries.length - 1].year + 5);
        if (y < 1900 || y > lastYear) {
            console.warn(`Trying to set year out of bounds, ${y}, using closest bound`);
            y = Math.min(y, lastYear);
            y = Math.max(1900, y);
        }

        // If the year is a multiple of 5 just return the actual record
        if (y % 5 == 0 && y <= this._coeffs.entries[this._coeffs.entries.length - 1].year) {
            const res = this._coeffs.entries.find(x => x.year == y);
            if (!res) throw new EngineError('IGRF', `Invalid Year: ${y}`);
            return res.allIndices;
        }
        
        // If not we'll have to interpolate
        let lowerBound: IIGRFTableEntry | undefined = undefined;
        let upperBound: IIGRFTableEntry | undefined = undefined;

        const igrfOrDgrf = this._coeffs.entries.filter(x => x.classType != 'SV');

        for (let i = 0; i < igrfOrDgrf.length; i++) {
            if (igrfOrDgrf[i].year < y) lowerBound = igrfOrDgrf[i];
            if (!upperBound && igrfOrDgrf[i].year > y) upperBound = igrfOrDgrf[i];
        }

        let latestMode: 'Indices' | 'SV' = 'Indices';

        if (!upperBound) {
            upperBound = this._coeffs.entries[this._coeffs.entries.length - 1];
            latestMode = 'SV';
        }

        if (!lowerBound || !upperBound) {
            console.error('No upper or lower bound:');
            console.log(lowerBound);
            console.log(upperBound);
            return [];
        }

        const lowerValues = lowerBound.allIndices;
        // We multiply by 5 because the SV is given by year and we're using 5-year intervals
        const upperValues = latestMode == 'Indices' ? upperBound.allIndices : lowerBound.allIndices.map((v, i) => v + ((upperBound as IIGRFTableEntry).allIndices[i] * 5));
        
        console.log(lowerValues);
        console.log(upperValues);
        console.log(lowerValues.map((v, i) => v + ((upperValues[i] - v) / 5) * (y - (lowerBound as IIGRFTableEntry).year)));

        return lowerValues.map((v, i) => v + ((upperValues[i] - v) / 5) * (y - (lowerBound as IIGRFTableEntry).year));
    }

    calculateAtLatLongRYr(lat: number, long: number, r: number, year: number) {

        const coLat = 90 - lat;
        const thetaRadians = MUtils.degToRad(coLat);
        const phiRadians = MUtils.degToRad(long);

        const { Br, Bp, Bt } = this.calculatePartialDerivatives(thetaRadians, phiRadians, year, r);

        const x = -Bt;
        const y = Bp;
        const z = -Br;

        const { declination, horizontal, inclination, totalIntensity } = this.calculateNonLinearComponents(x, y, z);

        console.log(`declination: ${declination}`);
        console.log(`horizontal: ${horizontal}`);
        console.log(`inclination: ${inclination}`);
        console.log(`totalIntensity: ${totalIntensity}`);
        
    }

}