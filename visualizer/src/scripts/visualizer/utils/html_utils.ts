
export class HTMLUtils {

    static downloadObjectAsFile(obj: any, fileName: string) {
        const body = document.body;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(obj)], {type: 'text/plain'}));
        a.setAttribute('download', fileName);
        body.appendChild(a);
        a.click();
        body.removeChild(a);
    }

}