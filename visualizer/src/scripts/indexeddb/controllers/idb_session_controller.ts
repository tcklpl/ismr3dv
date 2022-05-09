import { ISessionSave } from "../../visualizer/session/i_session_save";
import { IDBConnection } from "../idb_connection";
import { IDBController } from "../idb_controller";
import { IDBObjStore } from "../idb_object_stores";

export class IDBSessionController extends IDBController<ISessionSave> {

    constructor(con: IDBConnection) {
        super(con, IDBObjStore.SESSION);
    }
}