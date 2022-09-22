
export interface IIPPRequest {
    startDate: Date;
    endDate: Date;
    satellites: string;
    stations: number[];
    ion: number;
    filter?: string;
    field?: string;
}