import { IKeyedConfiguration } from "../../config/i_keyed_configuration";
import { IDBConnection } from "../idb_connection";
import { IDBController } from "../idb_controller";
import { IDBObjStore } from "../idb_object_stores";

export class IDBConfigController extends IDBController<IKeyedConfiguration> {

    constructor(con: IDBConnection) {
        super(con, IDBObjStore.CONFIG);
    }
}