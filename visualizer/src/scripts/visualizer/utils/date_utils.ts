
export class DateUtils {

    static to_DDMMYYYY_HHMMSS(d: Date) {

        const hours = d.getHours() < 10 ? `0${d.getHours()}` : `${d.getHours()}`;
        const minutes = d.getMinutes() < 10 ? `0${d.getMinutes()}` : `${d.getMinutes()}`;
        const secs = d.getSeconds() < 10 ? `0${d.getSeconds()}` : `${d.getSeconds()}`;
        return `${d.getDay()}/${d.getMonth()}/${d.getFullYear()} ${hours}:${minutes}:${secs}`;
    }

}