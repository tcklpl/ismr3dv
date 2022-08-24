import { IIPPInfo } from "../../../api/formats/i_ipp_info";

export interface IMomentColorQueueEntry {
    buffer: Float32Array;
    onColorCompletion: (colored: Uint8Array) => void;
}

export interface IMomentInterpEntry {
    data: IIPPInfo[];
    index: number;
}