import { Vec2 } from "../../engine/data_formats/vec/vec2";
import { IGRFModel } from "./igrf";

type PosEntry = {pos: Vec2, value: number};

export class IGRFLineBuilder {

    private _model = visualizer.igrfFetcher.instance;

    private narrowCoordinateInterval(min: Vec2, max: Vec2, value: number, threshold: number, year: number) {
        const model = this._model as IGRFModel;

        const numberOfCandidates = 7;
        const step = (max.y - min.y) / numberOfCandidates;

        const candidates = 
            Array.from(Array(numberOfCandidates))
            .map((x, i) => new Vec2(min.x, min.y + step * i))
            .map(v => <PosEntry>{pos: v, value: model.calculateAtLatLongRYr(v.y, v.x, 6371.2, year).inclination});

        let closestTop: PosEntry = candidates.find(x => x.value > value) as PosEntry;
        let closestBottom: PosEntry = candidates.find(x => x.value < value) as PosEntry;

        let found: PosEntry | undefined = undefined;

        candidates.forEach(c => {
            // Return the position if it's within the abs error threshold
            if (Math.abs(c.value - value) <= threshold) {
                if ((!!found && Math.abs(c.value - value) < Math.abs(found.value - value)) || !found) found = c;
            };

            if (c.value > value) {
                if (c.value < closestTop.value) closestTop = c;
            }
            else if (c.value < value) {
                if (c.value > closestBottom.value) closestBottom = c;
            }
        });

        if (!closestBottom) return [ closestTop.pos ];
        if (!closestTop) return [ closestBottom.pos ];

        return !!found ? [(found as PosEntry).pos] : [closestBottom.pos, closestTop.pos];
    }

    private getSphericalReflectedCoordinates(pos: Vec2) {
        const response = pos.clone();
        if (pos.x < -180) response.x = 180 + (pos.x + 180);
        else if (pos.x > 180) response.x = (pos.x + 180) % 360 - 180;

        if (pos.y < -90) response.y = 90 + (pos.y + 90);
        else if (pos.y > 90) response.y = (pos.y + 90) % 180 - 90;
        return response;
    }

    getCandidatesPerLongitude(value: number, threshold: number, year: number) {
        this._model = visualizer.igrfFetcher.instance;
        if (!this._model) {
            console.warn('Model not yet loaded!');
            return;
        }

        if (threshold <= 0) {
            console.error('Please define an error threshold bigger than 0');
            return;
        }

        const path: Vec2[] = [];

        let results = [new Vec2(-180, -90), new Vec2(-180, 90)];
        do {
            results = this.narrowCoordinateInterval(results[0], results[1], value, threshold, year);
        } while (results.length > 1);
        
        const firstPoint = results[0];
        path.push(firstPoint);

        let previousPoint = firstPoint;
        for (let x = -179; x <= 180; x++) {
            const newHigh = previousPoint.y + 2;
            const newLow = previousPoint.y - 2;

            let results = [this.getSphericalReflectedCoordinates(new Vec2(x, newLow)), this.getSphericalReflectedCoordinates(new Vec2(x, newHigh))];
            do {
                results = this.narrowCoordinateInterval(results[0], results[1], value, threshold, year);
            } while (results.length > 1);

            previousPoint = results[0];
            path.push(results[0]);
        }

        return path;
    }

}