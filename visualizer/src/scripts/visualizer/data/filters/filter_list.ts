
export interface IISMRFilter {
    name: string;
    displayName: string;
    dataType: 'number';
    filterGroup: ISMRFilterGroup;
}

export type ISMRFilterGroup = 'S4' | 'TEC' | 'Phi' | 'Temporal' | 'CCD' | 'SI' | 'CN0' | 'VS4' | 'Positional' | 'Locktime' | 'P' | 'T' | 'F2ND' | 'Other';

export const ISMRFilterList: IISMRFilter[] = [
    // S4
    {displayName: 'S4', name: 's4', dataType: 'number', filterGroup: 'S4'},
    {displayName: 'S4 Correction', name: 's4_correction', dataType: 'number', filterGroup: 'S4'},
    {displayName: 'S4 L2', name: 's4_l2', dataType: 'number', filterGroup: 'S4'},
    {displayName: 'S4 Correction L2', name: 's4_correction_l2', dataType: 'number', filterGroup: 'S4'},
    {displayName: 'S4 Corrected', name: 's4_corrected', dataType: 'number', filterGroup: 'S4'},
    {displayName: 'S4 L2 Corrected', name: 's4_l2_corrected', dataType: 'number', filterGroup: 'S4'},
    {displayName: 'S4 L5 Corrected', name: 's4_l5_corrected', dataType: 'number', filterGroup: 'S4'},
    {displayName: 'S4 L5', name: 's4_l5', dataType: 'number', filterGroup: 'S4'},
    {displayName: 'S4 Correlation L5', name: 's4_correction_l5', dataType: 'number', filterGroup: 'S4'},

    // TEC
    {displayName: 'TEC', name: 'tec', dataType: 'number', filterGroup: 'TEC'},
    {displayName: 'TEC 15', name: 'tec_15', dataType: 'number', filterGroup: 'TEC'},
    {displayName: 'TEC 30', name: 'tec_30', dataType: 'number', filterGroup: 'TEC'},
    {displayName: 'TEC 45', name: 'tec_45', dataType: 'number', filterGroup: 'TEC'},
    {displayName: 'DTEC 15 TOW', name: 'dtec_15tow', dataType: 'number', filterGroup: 'TEC'},
    {displayName: 'DTEC 3015', name: 'dtec_3015', dataType: 'number', filterGroup: 'TEC'},
    {displayName: 'DTEC 4530', name: 'dtec_4530', dataType: 'number', filterGroup: 'TEC'},
    {displayName: 'DTEC 6045', name: 'dtec_6045', dataType: 'number', filterGroup: 'TEC'},
    {displayName: 'VTEC', name: 'vtec', dataType: 'number', filterGroup: 'TEC'},

    // Phi
    {displayName: 'Phi 01 L1', name: 'phi01l1', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 03 L1', name: 'phi03l1', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 10 L1', name: 'phi10l1', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 30 L1', name: 'phi30l1', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 60 L1', name: 'phi60l1', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 01 L2', name: 'phi01_l2', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 03 L2', name: 'phi03_l2', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 10 L2', name: 'phi10_l2', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 30 L2', name: 'phi30_l2', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 60 L2', name: 'phi60_l2', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 01 L5', name: 'phi01_l5', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 03 L5', name: 'phi03_l5', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 10 L5', name: 'phi10_l5', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 30 L5', name: 'phi30_l5', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'Phi 60 L5', name: 'phi60_l5', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'VPhi 60 L1', name: 'vphi60_l1', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'VPhi 60 L2', name: 'vphi60_l2', dataType: 'number', filterGroup: 'Phi'},
    {displayName: 'VPhi 60 L5', name: 'vphi60_l5', dataType: 'number', filterGroup: 'Phi'},

    // Temporal
    {displayName: 'Hour', name: 'hour', dataType: 'number', filterGroup: 'Temporal'},
    {displayName: 'Month', name: 'month', dataType: 'number', filterGroup: 'Temporal'},
    {displayName: 'Day of Week', name: 'dow', dataType: 'number', filterGroup: 'Temporal'},
    {displayName: 'Minute', name: 'minute', dataType: 'number', filterGroup: 'Temporal'},
    {displayName: 'Hour (Float)', name: 'hour_f', dataType: 'number', filterGroup: 'Temporal'},
    {displayName: 'Day of Year', name: 'doy', dataType: 'number', filterGroup: 'Temporal'},
    {displayName: 'Year', name: 'year', dataType: 'number', filterGroup: 'Temporal'},
    {displayName: 'Year (Float)', name: 'year_f', dataType: 'number', filterGroup: 'Temporal'},

    // CCD
    {displayName: 'Average CCD L1', name: 'avgccd_l1', dataType: 'number', filterGroup: 'CCD'},
    {displayName: 'Sigma CCD L1', name: 'sigmaccd_l1', dataType: 'number', filterGroup: 'CCD'},
    {displayName: 'Average CCD L2', name: 'avgccd_l2', dataType: 'number', filterGroup: 'CCD'},
    {displayName: 'Sigma CCD L2', name: 'sigmaccd_l2', dataType: 'number', filterGroup: 'CCD'},
    {displayName: 'Average CCD L5', name: 'avgccd_l5', dataType: 'number', filterGroup: 'CCD'},
    {displayName: 'Sigma CCD L5', name: 'sigmaccd_l5', dataType: 'number', filterGroup: 'CCD'},

    // SI
    {displayName: 'SI L1', name: 'si_l1', dataType: 'number', filterGroup: 'SI'},
    {displayName: 'Numerator SI L1', name: 'numerator_si_l1', dataType: 'number', filterGroup: 'SI'},
    {displayName: 'SI L2', name: 'si_l2', dataType: 'number', filterGroup: 'SI'},
    {displayName: 'Numerator SI L2', name: 'numerator_si_l2', dataType: 'number', filterGroup: 'SI'},
    {displayName: 'SI L5', name: 'si_l5', dataType: 'number', filterGroup: 'SI'},
    {displayName: 'Numerator SI L5', name: 'numerator_si_l5', dataType: 'number', filterGroup: 'SI'},

    // CN0
    {displayName: 'Average CN0 L1', name: 'avg_cn0_l1', dataType: 'number', filterGroup: 'CN0'},
    {displayName: 'Average CN0 L2', name: 'avg_cn0_l2', dataType: 'number', filterGroup: 'CN0'},
    {displayName: 'Average CN0 L5', name: 'avg_cn0_l5', dataType: 'number', filterGroup: 'CN0'},

    // VS4
    {displayName: 'VS4 L1', name: 'vs4_l1', dataType: 'number', filterGroup: 'VS4'},
    {displayName: 'VS4 L2', name: 'vs4_l2', dataType: 'number', filterGroup: 'VS4'},
    {displayName: 'VS4 L5', name: 'vs4_l5', dataType: 'number', filterGroup: 'VS4'},

    // Positional
    {displayName: 'Azimuth', name: 'azim', dataType: 'number', filterGroup: 'Positional'},
    {displayName: 'Elevation', name: 'elev', dataType: 'number', filterGroup: 'Positional'},
    {displayName: 'Latitude', name: 'lat_', dataType: 'number', filterGroup: 'Positional'},
    {displayName: 'Longitude', name: 'long_', dataType: 'number', filterGroup: 'Positional'},
    {displayName: 'X', name: 'x_', dataType: 'number', filterGroup: 'Positional'},
    {displayName: 'Y', name: 'y_', dataType: 'number', filterGroup: 'Positional'},
    {displayName: 'Z', name: 'z_', dataType: 'number', filterGroup: 'Positional'},

    // Locktime
    {displayName: 'LOCKTIME L1', name: 'locktime_l1', dataType: 'number', filterGroup: 'Locktime'},
    {displayName: 'Locktime L2', name: 'locktime_l2', dataType: 'number', filterGroup: 'Locktime'},
    {displayName: 'Locktime L5', name: 'locktime_l5', dataType: 'number', filterGroup: 'Locktime'},

    // P
    {displayName: 'P L1', name: 'p_l1', dataType: 'number', filterGroup: 'P'},
    {displayName: 'P L2', name: 'p_l2', dataType: 'number', filterGroup: 'P'},
    {displayName: 'P L5', name: 'p_l5', dataType: 'number', filterGroup: 'P'},

    // T
    {displayName: 'T L1', name: 't_l1', dataType: 'number', filterGroup: 'T'},
    {displayName: 'T L2', name: 't_l2', dataType: 'number', filterGroup: 'T'},
    {displayName: 'T L5', name: 't_l5', dataType: 'number', filterGroup: 'T'},

    // F2ND
    {displayName: 'F2ND TEC Locktime', name: 'f2nd_tec_locktime', dataType: 'number', filterGroup: 'F2ND'},
    {displayName: 'F2ND TEC CN0', name: 'f2nd_tec_cn0', dataType: 'number', filterGroup: 'F2ND'},

    // Other
    {displayName: 'SBF Block', name: 'sbf_block', dataType: 'number', filterGroup: 'Other'},
    {displayName: 'SBF2 ISMR Version', name: 'sbf2ismr_version', dataType: 'number', filterGroup: 'Other'}
];

export function getISMRFilterByName(name: string) {
    return ISMRFilterList.find(x => x.name == name);
};
