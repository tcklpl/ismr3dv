import { EngineError } from "../../../../engine/errors/engine_error";
import { FilterOperator } from "./filter_operator";
import { FOBetween } from "./numeric/between";
import { FODifferent } from "./numeric/different";
import { FOEquals } from "./numeric/equals";
import { FOGreater } from "./numeric/greater";
import { FOGreaterOrEquals } from "./numeric/greater_or_equals";
import { FOLess } from "./numeric/less";
import { FOLessOrEquals } from "./numeric/less_or_equals";
import { FONotBetween } from "./numeric/not_between";

export class NumericFilterOperators {

    static BETWEEN = new FOBetween();
    static NOT_BETWEEN = new FONotBetween();

    static DIFFERENT = new FODifferent();
    static EQUALS = new FOEquals();

    static GREATER_OR_EQUALS = new FOGreaterOrEquals();
    static GREATER = new FOGreater();

    static LESS_OR_EQUALS = new FOLessOrEquals();
    static LESS = new FOLess();

    private static _operators: FilterOperator<number>[] = [
        this.BETWEEN, this.NOT_BETWEEN, this.DIFFERENT, this.EQUALS, this.GREATER_OR_EQUALS, this.GREATER, this.LESS_OR_EQUALS, this.LESS
    ];
    
    static get asList() {
        return this._operators;
    }

    static getByName(name: string) {
        return this._operators.find(x => x.name == name);
    }

    static assertGetByName(name: string) {
        const res = this.getByName(name);
        if (!res) throw new EngineError('Numeric Filter Assertion', `Failed to get numeric filter '${name}'`);
        return res;
    }

}