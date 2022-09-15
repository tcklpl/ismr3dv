import { IISMRFilter } from "./filter_list";
import { FilterOperator } from "./operators/filter_operator";

export class DataFilter {

    filter?: IISMRFilter;
    operator?: FilterOperator<number>;
    arguments: number[] = [];

    equals(other: DataFilter) {
        return !!this.filter && this.filter === other.filter;
    }

    get isComplete() {
        return !!this.filter && !!this.operator && this.operator.matchAgainst(...this.arguments);
    }

}