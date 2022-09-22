import { IISMRFilter } from "./filter_list";
import { FilterOperator } from "./operators/filter_operator";
import { NumericFilterOperators } from "./operators/numeric_filter_oprators";

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

    get asSerializable(): IDataFilterSave {
        return {
            filter: this.filter,
            operatorName: this.operator?.name,
            arguments: this.arguments
        };
    }

    static fromSerialization(s: IDataFilterSave) {
        const df = new DataFilter();
        df.filter = s.filter;
        df.operator = NumericFilterOperators.getByName(s.operatorName || '');
        df.arguments = s.arguments;
        return df;
    }

}

export interface IDataFilterSave {
    filter?: IISMRFilter;
    operatorName?: string;
    arguments: number[];
}