import { EngineError } from "../../../../engine/errors/engine_error";
import { IInterpolatorOption } from "./i_interpolator_options";
import { miInverseDistanceWeighting } from "./mi_inverse_distance_weighting";
import { miNoInterpolation } from "./mi_no_interpolation"

export class InterpolatingFunctions {

    private static _instances: InterpolatingFunctions[] = [];

    static NO_INTERPOLATION = new InterpolatingFunctions('No Interpolation', miNoInterpolation, []);
    static INVERSE_DISTANCE_WEIGHTING = new InterpolatingFunctions('Inverse Distance Weighting', miInverseDistanceWeighting, [
        { name: 'P', valueType: 'number', min: 1, max: 10, default: 2 },
        { name: 'Interpolation Distance', valueType: 'number', min: 1, max: 100, default: 20 },
        { name: 'Color Distance', valueType: 'number', min: 1, max: 100, default: 10 }
    ]);

    static DEFAULT  = this.INVERSE_DISTANCE_WEIGHTING;

    private _name: string;
    private _func: (...args: any[]) => any;
    private _options: IInterpolatorOption[];
    
    private constructor(name: string, func: (...args: any[]) => any, options: IInterpolatorOption[]) {
        this._name = name;
        this._func = func;
        this._options = options;
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

    static get all() {
        return this._instances;
    }

    get name() {
        return this._name;
    }

    get func() {
        return this._func;
    }

    get options() {
        return this._options;
    }

}