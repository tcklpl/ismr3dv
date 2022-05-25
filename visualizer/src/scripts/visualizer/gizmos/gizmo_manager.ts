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

    get allGizmos() {
        return [ this._artic, this._cancer, this._equator, this._capricorn, this._antartic ];
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