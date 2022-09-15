import { FilterOperator } from "../filter_operator";

export class FOGreater extends FilterOperator<number> {

    constructor() {
        super('greater', '&gt;', 1);
    }

    matchAgainst(...args: number[]): boolean {
        return args.length == 1 && typeof args[0] === 'number' && !isNaN(args[0]);
    }

    asFilterStringWithArgs(...args: number[]): string {
        if (!this.matchAgainst(...args)) {
            console.warn(`Invalid filter args: ${args}`);
            return '';
        }
        return `>${args[0]}`;
    }

}