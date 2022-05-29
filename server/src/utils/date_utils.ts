
export class DateUtils {

    static twoDigitFormatter = Intl.NumberFormat('en-US', {
        minimumIntegerDigits: 2,
        maximumFractionDigits: 0,
    });

    static formatToLocalISOLike(d: Date) {
        return `${d.getUTCFullYear()}-${this.twoDigitFormatter.format(d.getUTCMonth())}-${this.twoDigitFormatter.format(d.getUTCDate())}%20${this.twoDigitFormatter.format(d.getUTCHours())}:${this.twoDigitFormatter.format(d.getUTCMinutes())}:${this.twoDigitFormatter.format(d.getUTCSeconds())}`;
    }

}