import { Vec3 } from "../../engine/data_formats/vec/vec3";

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

    static saveBlob(blob: Blob | null, fileName: string) {
        if (!blob) {
            console.warn('Trying to save empty blob');
            return;
        }
        const body = document.body;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.setAttribute('download', fileName);
        body.appendChild(a);
        a.click();
        body.removeChild(a);
    }

    static hexToVec3(hex: string) {
        const val = hex.replace('#', '');
        const cr = parseInt(val.substring(0, 2), 16) / 255;
        const cg = parseInt(val.substring(2, 4), 16) / 255;
        const cb = parseInt(val.substring(4, 6), 16) / 255;
        return new Vec3(cr, cg, cb);
    }

}