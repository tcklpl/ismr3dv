
export class DateUtils {

    static twoDigitFormatter = Intl.NumberFormat('en-US', {
        minimumIntegerDigits: 2,
        maximumFractionDigits: 0,
    });

    static formatToLocalISOLike(d: Date) {
        return `${d.getFullYear()}-${this.twoDigitFormatter.format(d.getMonth())}-${this.twoDigitFormatter.format(d.getDate())}%20${this.twoDigitFormatter.format(d.getHours())}:${this.twoDigitFormatter.format(d.getMinutes())}:${this.twoDigitFormatter.format(d.getSeconds())}`;
    }

}