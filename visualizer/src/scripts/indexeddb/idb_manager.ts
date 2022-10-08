import { IDBConfigController } from "./controllers/idb_config_controller";
import { IDBSessionController } from "./controllers/idb_session_controller";
import { IDBConnection } from "./idb_connection";

export class IDBManager {

    private _idbConnection: IDBConnection;

    private _idbSessionController: IDBSessionController;
    private _idbConfigController: IDBConfigController;

    private _onReady: (() => void)[] = [];

    constructor() {
        this._idbConnection = new IDBConnection();
        this._idbConnection.onReady = () => this._onReady.forEach(f => f());
        this._idbSessionController = new IDBSessionController(this._idbConnection);
        this._idbConfigController = new IDBConfigController(this._idbConnection);
    }

    onReady(f: () => void) {
        if (this.connection.initialized) f();
        else this._onReady.push(f);
    }

    get isAvailable() {
        return this._idbConnection.available;
    }

    get connection() {
        return this._idbConnection;
    }

    get sessionController() {
        return this._idbSessionController;
    }

    get configController() {
        return this._idbConfigController;
    }

}