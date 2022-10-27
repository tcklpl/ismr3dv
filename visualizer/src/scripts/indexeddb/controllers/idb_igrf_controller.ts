import { IIGRFSave } from "../../visualizer/igrf/igrf_model_coeffs";
import { IDBConnection } from "../idb_connection";
import { IDBController } from "../idb_controller";
import { IDBObjStore } from "../idb_object_stores";

export class IDBIGRFController extends IDBController<IIGRFSave> {

    constructor(con: IDBConnection) {
        super(con, IDBObjStore.IGRF);
    }
}