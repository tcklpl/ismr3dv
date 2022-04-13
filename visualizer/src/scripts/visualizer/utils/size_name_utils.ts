
export class SizeNameUtils {

    static getNameBySize(value: number, sizes: string[], step: number, curIndex?: number): string {
        let i = curIndex ?? 0;
        if (i > sizes.length) throw `Insufficient size name vector, trying to access index ${i} with value ${value}`;
        if (value < step) {
            return `${this.truncateNumber(value, 2)} ${sizes[i]}`;
        };
        return this.getNameBySize(value / step, sizes, step, i + 1);
    }

    static truncateNumber(value: number, decimal: number) {
        const isDecimal = Math.floor(value) != value;
        return isDecimal ? Math.trunc(value * Math.pow(10, decimal)) / Math.pow(10, decimal) : value;
    }

}