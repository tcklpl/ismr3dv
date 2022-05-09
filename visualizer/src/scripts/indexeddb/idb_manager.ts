import { IDBSessionController } from "./controllers/idb_session_controller";
import { IDBConnection } from "./idb_connection";

export class IDBManager {

    private _idbConnection: IDBConnection;

    private _idbSessionController: IDBSessionController;

    constructor() {
        this._idbConnection = new IDBConnection();
        this._idbSessionController = new IDBSessionController(this._idbConnection);
    }

    get connection() {
        return this._idbConnection;
    }

    get sessionController() {
        return this._idbSessionController;
    }

}