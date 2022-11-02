import { ISessionIPPSave } from "../../visualizer/session/i_session_ipp_save";
import { IDBConnection } from "../idb_connection";
import { IDBController } from "../idb_controller";
import { IDBObjStore } from "../idb_object_stores";

export class IDBSessionIPPController extends IDBController<ISessionIPPSave> {

    constructor(con: IDBConnection) {
        super(con, IDBObjStore.SESSION_IPP);
    }
}