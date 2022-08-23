
export class WorkerUtils {

    static createWorkerFromFunction(fn: (...args: any[]) => void, ...params: any[]) {
        const blob = new Blob([`(${fn.toString()})(${params})`], {type: "text/javascript"});
        return new Worker(window.URL.createObjectURL(blob));
    }

}