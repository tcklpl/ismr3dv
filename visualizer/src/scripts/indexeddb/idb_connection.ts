
export class IDBConnection {

    private _dbName = "ismr";
    private _db!: IDBDatabase;
    private _avaialble = false;

    constructor() {
        const openreq = indexedDB.open(this._dbName, 1);
        openreq.onupgradeneeded = () => {
            this._db = openreq.result;
            this.setupDB();
        }
        openreq.onerror = () => this.onDBFail(openreq.error);
        openreq.onsuccess = () => {
            this._db = openreq.result;
            this._avaialble = true;
        }
    }

    private onDBFail(exp: DOMException | null) {
        throw `Failed to create indexed DB, do your browser support it? ${exp?.code} : ${exp?.name} : ${exp?.stack}`;
    }

    private setupDB() {
        this._db.createObjectStore('sessions', {keyPath: 'name'});
    }

    get db() {
        return this._db;
    }

    get available() {
        return this._avaialble;
    }
}