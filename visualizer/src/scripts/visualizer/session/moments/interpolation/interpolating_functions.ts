import { EngineError } from "../../../../engine/errors/engine_error";
import { miInverseDistanceWeighting } from "./mi_inverse_distance_weighting";
import { miNoInterpolation } from "./mi_no_interpolation"

export class InterpolatingFunctions {

    private static _instances: InterpolatingFunctions[] = [];

    static NO_INTERPOLATION = new InterpolatingFunctions('No Interpolation', miNoInterpolation);
    static INVERSE_DISTANCE_WEIGHTING = new InterpolatingFunctions('Inverse Distance Weighting', miInverseDistanceWeighting);

    private _name: string;
    private _func: (...args: any[]) => any;
    
    private constructor(name: string, func: (...args: any[]) => any) {
        this._name = name;
        this._func = func;
        InterpolatingFunctions._instances.push(this);
    }

    static getByName(name: string) {
        return this._instances.find(x => x._name == name);
    }

    static assertGetByName(name: string) {
        const res = this.getByName(name);
        if (!res) throw new EngineError('Interpolating Functions', `Failed to get function '${name}'`);
        return res;
    }

    get name() {
        return this._name;
    }

    get func() {
        return this._func;
    }

}