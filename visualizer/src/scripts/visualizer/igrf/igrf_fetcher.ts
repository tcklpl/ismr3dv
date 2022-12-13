import { IGRFModel } from "./igrf";
import { IGRFModelCoeffs, IIGRFTableEntry } from "./igrf_model_coeffs";

export class IGRFFetcher {

    private _igrfFolderUrl = 'https://www.ngdc.noaa.gov/IAGA/vmod/coeffs/';
    private _controller = visualizer.idb.igrfController;
    private _igrfInstance?: IGRFModel;

    async loadModel() {
        this._igrfInstance = await this.assertLatest();
    }

    async assertLatest() {
        const allDbEntries = await this._controller.fetchAll();
        const currentYear = new Date().getFullYear();

        // if there's a model saved in the idb we'll validate it
        if (allDbEntries.length > 0) {
            // get the latest version sotred on the indexedDB
            const dbLatest = allDbEntries.sort((a, b) => b.version - a.version)[0];
            // If there's more than a 5 year gap between the model and what's saved locally
            // (5 years because the model updates every 5 years)
            if (currentYear - dbLatest.entries[dbLatest.entries.length - 1].year > 5) {
                return await this.updateModel(dbLatest.version);
            }
            return new IGRFModel(new IGRFModelCoeffs(dbLatest.version, dbLatest.entries));
        }
        // else just download the latest
        else {
            return await this.updateModel();
        }
    }

    private async updateModel(currentVersion: number = -1) {
        
        const latestVersion = await this.getLatestVersion();

        // The model's validity has expired and there's not a new one
        if (latestVersion == currentVersion) {
            console.warn(`The IGRF model's validity has expired and there's not a new one available`);
        }

        const src = await this.fetchLatestModel();
        const coeffs = this.parseModel(src);

        const coeffObj = new IGRFModelCoeffs(latestVersion, coeffs);
        this._controller.put(coeffObj.asSerializable);

        return new IGRFModel(coeffObj);
    }

    private async getLatestVersion() {
        const pageSource = await (await fetch(this._igrfFolderUrl)).text();
        const allMatches = pageSource.match(/igrf([0-9]+)coeffs\.txt/g);
        const noDuplicates = [...new Set(allMatches)];
        const numbers = noDuplicates.map(nd => (/([0-9]+)/.exec(nd) as RegExpExecArray)[0]).map(s => parseInt(s)).sort((a, b) => b - a);
        return numbers[0];
    }

    private async fetchLatestModel() {
        const version = await this.getLatestVersion();
        return await (await fetch(`https://www.ngdc.noaa.gov/IAGA/vmod/coeffs/igrf${version}coeffs.txt`)).text();
    }

    private parseModel(source: string) {

        const entries: IIGRFTableEntry[] = [];

        const lines = source.split('\n');
        for (const l of lines) {
            // Ignore comments
            if (l.startsWith('#') || !l) continue;
    
            // get all line parts and ignore empty spaces
            const lineParts = l.split(' ').filter(l => !!l);
    
            // the first 3 values will be indices
            const actualValues = lineParts.slice(3, lineParts.length);
    
            // first line, will have igrf/dgrf/sv notation
            if (lineParts[0] == 'c/s') {
                // insert the elements in the list
                actualValues.forEach(v => {
                    entries.push({
                        classType: v as 'IGRF' | 'DGRF' | 'SV',
                        year: -1,
                        g: [],
                        h: [],
                        allIndices: []
                    });
                });
            }
    
            // second line, will contain the years
            else if (lineParts[0] == 'g/h') {
                actualValues.forEach((v, i) => {
                    // the one that will be odd will be the secular variation (SV) - that appears as 2020-25
                    // but this probably won't be an issue
                    entries[i].year = parseInt(v);
                });
            }
    
            // value lines, these are formatted as
            // [g/h] [n] [m] [...values]
            else {
                const gh = lineParts[0];
                const n = parseInt(lineParts[1]);
                const m = parseInt(lineParts[2]);
    
                actualValues.forEach((v, i) => {
                    // parse each value and insert it on the list
                    const element = entries[i];
                    const val = parseFloat(v);
                    (gh == 'g' ? element.g : element.h).push({
                        n: n,
                        m: m,
                        val: val
                    });
                    element.allIndices.push(val);
                });
            }
        }

        return entries;
    }

    get instance() {
        return this._igrfInstance;
    }
}