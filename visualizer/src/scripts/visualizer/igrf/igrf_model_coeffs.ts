
export interface IIGRFNMKeyedEntry {
    n: number;
    m: number;
    val: number;
}

export interface IIGRFTableEntry {
    classType: 'IGRF' | 'DGRF' | 'SV';
    year: number;
    g: IIGRFNMKeyedEntry[];
    h: IIGRFNMKeyedEntry[];
    allIndices: number[];
}

export interface IIGRFSave {
    version: number;
    entries: IIGRFTableEntry[];
}

export class IGRFModelCoeffs {

    private _version: number;
    private _entries: IIGRFTableEntry[] = [];

    constructor(version: number, entries: IIGRFTableEntry[]) {
        this._version = version;
        this._entries = entries;
    }

    getByYear(year: number) {
        let lowerI = -1;
        
        for (let i = 0; i < this._entries.length; i++) {
            if (this._entries[i].year <= year && this._entries[i].classType != 'SV') lowerI = i;
            else break;
        }

        if (lowerI == -1) {
            console.warn(`Empty coeffs for year '${year}', returning first element on the list...`);
            return this.entries[0];
        }

        return this.entries[lowerI];
    }

    get version() {
        return this._version;
    }

    get entries() {
        return this._entries;
    }

    get asSerializable(): IIGRFSave {
        return {
            version: this._version,
            entries: this._entries
        };
    }
    

}