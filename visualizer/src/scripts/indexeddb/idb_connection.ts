
export class IDBConnection {

    private _dbName = "ismr";
    private _db!: IDBDatabase;

    constructor() {
        const openreq = indexedDB.open(this._dbName, 1);
        openreq.onupgradeneeded = () => {
            this._db = openreq.result;
            this.setupDB();
        }
        openreq.onerror = () => this.onDBFail();
        openreq.onsuccess = () => {
            this._db = openreq.result;
        }
    }

    private onDBFail() {
        throw `Failed to create indexed DB, do your browser support it?`;
    }

    private setupDB() {
        this._db.createObjectStore('sessions', {keyPath: 'name'});
    }

    get db() {
        return this._db;
    }
}