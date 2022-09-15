import { FilterOperator } from "../filter_operator";

export class FONotBetween extends FilterOperator<number> {

    constructor() {
        super('not_between', 'Not Between', 2);
    }

    matchAgainst(...args: number[]): boolean {
        return args.length == 2 && typeof args[0] === 'number' && typeof args[1] === 'number' && !isNaN(args[0]) && !isNaN(args[1]);
    }

    asFilterStringWithArgs(...args: number[]): string {
        if (!this.matchAgainst(...args)) {
            console.warn(`Invalid filter args: ${args}`);
            return '';
        }
        return `not between ${args[0]} and ${args[1]}`;
    }

}