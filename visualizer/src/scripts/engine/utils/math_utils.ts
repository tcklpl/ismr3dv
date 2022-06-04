import { Vec2 } from "../data_formats/vec/vec2";
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

    static normalizedLatLong(lat: number, long: number) {
        lat = (-lat + 90) / 180;
        long = (long + 180) / 360;
        return new Vec2(lat, long);
    }

    static gaussianKernelValueOf(x: number, width: number, center: number = 0, height: number = 1) {
        return height * Math.exp(-((x - center)**2) / width);
    }

    static generateGaussianKernel(len: number, width: number, center: number = 0, height: number = 1) {
        const res: number[] = [];
        for (let i = 1; i <= len; i++) {
            res.push(this.gaussianKernelValueOf(i, width, center, height));
        }
        return res;
    }

    static fatorial(x: number) {
        if (x < 0) throw `Cannot calculate the fatorial of a negative number`;
        if (Math.floor(x) != x) throw `Cannot calculate the fatorial of a non-integer`;
        if (x == 0) return 1;
        let sum = x;
        while (--x > 0) {
            sum *= x;
        }
        return sum;
    }

    /**
     *  𝛿_ (µ² - 1)^n
     *  𝛿µ
     * 
     *  Solved with the specified µ (u).
     * 
     * @param n the value to elevate.
     * @param u µ.
     * @returns the result.
     */
    static legendrePolynomialDerivativePart(n: number, u: number) {
        return 2 * n * u * (u**2 - 1)**(n-1);
    }

    /**
     *  Kronecker delta for i and j (𝛿(i,j)).
     * 
     * @param i 
     * @param j 
     * @returns 1 if i == j, 0 otherwise.
     */
    static kroneckerDelta(i: number, j: number) {
        return i == j ? 1 : 0;
    }

    /**
     *  Ferrer's normalization of associated legendre functions.
     * 
     *  ___1___  (1 - µ²)^(m / 2) (𝛿_)^(n + m) (µ² - 1)^n
     *  n^n * n!                  (dµ)
     * 
     * @param n n
     * @param m m
     * @param u µ
     * @returns the result.
     */
    static ferrersAssociatedLegendreFunction(n: number, m: number, u: number) {
        let result = 1 / (2**n * this.fatorial(n));
        if (m != 0) {
            result *= (1 - u**2)**(m/2);
        }
        return result * this.legendrePolynomialDerivativePart(n, u)**(n+m);
    }

    /**
     *  Schmidt's quasi-normalized functions (valid for m).
     *     _______________________
     * _  /(2 - 𝛿(0,m)) _(n_-_m)!_  P(n,m)(µ)
     *  \/               (n + m)!
     * 
     * @param m m.
     * @param n n.
     * @param u µ.
     * @returns the result.
     */
    static schmidtQuasiNormalization(m: number, n: number, u: number) {
        let result = (2 - this.kroneckerDelta(m , 0)) * (this.fatorial(n - m) / this.fatorial(n + m))
        result = Math.sqrt(result);
        return result * this.ferrersAssociatedLegendreFunction(n, m, u);
    }
}