import { IIPPInfo } from "../api/formats/i_ipp_info";

/**
 * This interface exists to fragment the session save in order to make the session list
 * loading quicker.
 * 
 * This save will alse be loaded ONLY on a webworker that will calculate everything needed
 * for the sessions, as this was a bottleneck.
 */
export interface ISessionIPPSave {
    // same name of the session
    name: string;

    raw_ipp: IIPPInfo[];
}