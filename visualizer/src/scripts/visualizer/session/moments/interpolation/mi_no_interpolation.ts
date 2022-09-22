import { IMomentInterpEntry } from "./i_moment_queue_entries";

export const miNoInterpolation = (width: number, height: number) => {

    const getPosition = (x: number, y: number) => y * width + x;

    self.onmessage = e => {
        const entry = e.data as IMomentInterpEntry;
        const data = entry.data;
        const uniquePositions: Map<{x: number, y: number}, number[]> = new Map();

        const buffer = new Float32Array(width * height);

        data.forEach(d => {
            const normalizedLat = (-d.lat + 90) / 180;
            const normalizedLong = (d.long + 180) / 360;

            const x = Math.round(normalizedLong * width);
            const y = Math.round(normalizedLat * height);
            const value = d.value;

            const key = {x: x, y: y};
            if (uniquePositions.has(key)) {
                uniquePositions.get(key)?.push(value);
            } else {
                uniquePositions.set(key, [value]);
            }
        });
        
        uniquePositions.forEach((v, k) => {
            const finalValue = v.reduce((prev, cur) => prev += cur, 0) / v.length;
            buffer[getPosition(k.x, k.y)] = finalValue;
        });

        self.postMessage({buffer: buffer, index: entry.index});
    };
};