
export abstract class FilterOperator<T> {

    private _name: string;
    private _symbol: string;
    private _argCount: number;
    
    constructor(name: string, symbol: string, argCount: number) {
        this._name = name;
        this._symbol = symbol;
        this._argCount = argCount;
    }

    abstract matchAgainst(...args: T[]): boolean;

    abstract asFilterStringWithArgs(...args: T[]): string;

    get name() {
        return this._name;
    }

    get symbol() {
        return this._symbol;
    }

    get argCount() {
        return this._argCount;
    }

}