
export class SizeNameUtils {

    static getNameBySize(value: number, sizes: string[], step: number, curIndex?: number): string {
        let i = curIndex ?? 0;
        if (i > sizes.length) throw `Insufficient size name vector, trying to access index ${i} with value ${value}`;
        if (value < step) {
            const isDecimal = Math.floor(value) != value;
            return `${isDecimal ? Math.trunc(value * Math.pow(10, 2)) / Math.pow(10, 2) : value} ${sizes[i]}`;
        };
        return this.getNameBySize(value / step, sizes, step, i + 1);
    }

}