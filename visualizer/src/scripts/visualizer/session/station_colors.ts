import { UBoolean } from "../../engine/data_formats/uniformable_basics/u_boolean";
import { Vec3 } from "../../engine/data_formats/vec/vec3";

export class StationColors {

    static IDLE = new StationColors(new Vec3(0, 0.5, 1), false);
    static HOVER = new StationColors(new Vec3(1, 0.5, 0), true);
    static SELECTED = new StationColors(new Vec3(0, 1, 0), true);

    private _color: Vec3;
    private _bloom: UBoolean;

    private constructor(color: Vec3, bloom: boolean) {
        this._color = color;
        this._bloom = new UBoolean(bloom);
    }

    get color() {
        return this._color;
    }

    get bloom() {
        return this._bloom;
    }

}