
export class AsyncUtils {

    static getImage(path: string, callback: (a: HTMLImageElement) => void) {
        let img = new Image();
        img.onload = () => callback(img);
        img.src = path;
    }

    static getUrlAs<T>(path: string, callback: (a: T) => void) {
        $.ajax({
            type: "GET",
            url: path,
        })
        .done(ret => {
            callback(ret);
        })
        .fail((jqXHR, textStatus, error) => {
            throw `Failed loading ${path}: ${error}`;
        });
    }

}