import { IDataFilterSave } from "../../visualizer/data/filters/data_filter";

export interface ISerializedFilter extends IDataFilterSave {
    active: boolean;
    name: string;
}