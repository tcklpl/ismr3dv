import { IMomentInterpEntry } from "./i_moment_queue_entries";

export const miInverseDistanceWeighting = (width: number, height: number) => {

    const colorDistance = 10;

    const interpolationDistance = 20;
    const interpDstSquared = interpolationDistance**2;

    const p = 2;

    const getPosition = (x: number, y: number) => y * width + x;
    const distanceSquared = (x1: number, y1: number, x2: number, y2: number) => ((x1 - x2)**2 + (y1 - y2)**2);

    const w = (distance: number) => 1/(distance**p);

    self.onmessage = e => {
        const entry = e.data as IMomentInterpEntry;
        const data = entry.data;

        const uniquePositions: Map<{x: number, y: number}, number[]> = new Map();
        const buffer = new Float32Array(width * height);

        // populate the buffer with all the values
        data.forEach(d => {
            const normalizedLat = (-d.lat + 90) / 180;
            const normalizedLong = (d.long + 180) / 360;
            const x = Math.round(normalizedLong * width);
            const y = Math.round(normalizedLat * height);

            const key = {x: x, y: y};
            if (uniquePositions.has(key)) {
                uniquePositions.get(key)?.push(d.value);
            } else {
                uniquePositions.set(key, [d.value]);
            }
        });

        const positionedValues: {x: number, y: number, value: number}[] = [];

        uniquePositions.forEach((v, k) => {
            const finalValue = v.reduce((prev, cur) => prev += cur, 0) / v.length;
            positionedValues.push({
                x: k.x,
                y: k.y,
                value: finalValue
            });
        });

        // get the bounds
        let lowestX = width;
        let highestX = 0;
        let lowestY = height;
        let highestY = 0;
        positionedValues.forEach(v => {
            if (v.x < lowestX)
                lowestX = v.x;
            if (v.x > highestX)
                highestX = v.x;
            if (v.y < lowestY)
                lowestY = v.y;
            if (v.y > highestY)
                highestY = v.y;
        });
        lowestX -= colorDistance;
        highestX += colorDistance;
        lowestY -= colorDistance;
        highestY += colorDistance;

        for (let x = lowestX; x <= highestX; x++) {
            for (let y = lowestY; y <= highestY; y++) {

                // get all the values near this point
                const neighbourhood = positionedValues.filter(v => distanceSquared(x, y, v.x, v.y) <= interpDstSquared).map(v => {
                    const distance = Math.sqrt(distanceSquared(x, y, v.x, v.y));
                    return {
                        x: v.x,
                        y: v.y,
                        value: v.value,
                        distance: distance,
                        w: w(distance)
                    }
                });
                if (neighbourhood.filter(v => v.distance <= colorDistance).length == 0) continue;

                let result = 0;
                const same = neighbourhood.find(v => v.distance == 0);

                if (!same) {

                    const nominator = neighbourhood.reduce((prev, next) => prev += next.w * next.value, 0);
                    const denominator = neighbourhood.reduce((prev, next) => prev += next.w, 0);

                    result = nominator / denominator;

                } else {
                    result = same.value;
                }
                
                buffer[getPosition(x, y)] = result;
            }
        }
        
        self.postMessage({buffer: buffer, index: entry.index});
    };
};