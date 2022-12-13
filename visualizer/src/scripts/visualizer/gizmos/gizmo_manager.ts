import { Gizmo } from "../../engine/data_formats/gizmos/gizmo";
import { LineLoop } from "../../engine/data_formats/mesh/line_loop";
import { MUtils } from "../../engine/utils/math_utils";
import { GizmoAntarticCircle } from "./gz_antartic";
import { GizmoArticCircle } from "./gz_artic";
import { GizmoCancer } from "./gz_cancer";
import { GizmoCapricorn } from "./gz_capricorn";
import { GizmoEquator } from "./gz_equator";

export class GizmoManager {

    private _antartic = new GizmoAntarticCircle();
    private _artic = new GizmoArticCircle();
    private _cancer = new GizmoCancer();
    private _capricorn = new GizmoCapricorn();
    private _equator = new GizmoEquator();
    private _magneticGizmos: Gizmo[] = [];

    createMagneticFieldGizmo(inclination: number) {
        if (this._magneticGizmos.find(x => x.name == `Magnetic: ${inclination} degrees`)) return false;
        if (!visualizer.session) {
            console.warn('Trying to create a magnetic gizmo without an active session!');
            return false;
        }
        // Year with decimal places representing time within that year.
        // 1000ms * 60s * 60m * 24h * 365.25y + 1970 because epoch time started in 1970
        // this should yield something like 2022.9493729978199
        const year = visualizer.session.startDate.getTime() / (1000 * 60 * 60 * 24 * 365.25) + 1970;
        const path = visualizer.igrfLineBuilder.getCandidatesPerLongitude(inclination, 0.1, year);
        if (!path) {
            console.warn(`Failed to generate path for gizmo using inclination=${inclination}, threshold=0.1, year=${year}`);
            return false;
        }

        const line = new LineLoop(path.map(c => MUtils.latLongToUnitSphere(c.y, c.x)));
        const gizmo = new Gizmo(`Magnetic: ${inclination} degrees`, line, 'images/icons/magnetic.png');
        gizmo.enabled = true;
        this.addGizmo(gizmo);
        return true;
    }

    addGizmo(g: Gizmo) {
        this._magneticGizmos.push(g);
        visualizer.events.dispatchEvent('magnetic-gizmos-att');
    }

    deleteMagneticGizmo(g: Gizmo) {
        const i = this._magneticGizmos.indexOf(g);
        if (i > -1) {
            this._magneticGizmos.splice(i, 1);
        }
        visualizer.events.dispatchEvent('magnetic-gizmos-att');
    }

    get allGizmos() {
        return [...this.fixedGizmos, ...this.magneticGizmos];
    }

    get fixedGizmos() {
        return [ this._artic, this._cancer, this._equator, this._capricorn, this._antartic ];
    }

    get magneticGizmos() {
        return this._magneticGizmos;
    }

    get antartic() {
        return this._antartic;
    }

    get artic() {
        return this._artic;
    }

    get cancer() {
        return this._cancer;
    }

    get capricorn() {
        return this._capricorn;
    }

    get equator() {
        return this._equator;
    }

}