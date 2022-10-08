import { MessageScreen } from "../ui/message_screen";

export class IDBConnection {

    private _dbName = "ismr";
    private _dbVersion = 2;

    private _db!: IDBDatabase;
    private _avaialble = false;
    private _initialized = false;

    onReady?: () => void;

    constructor() {
        const openreq = indexedDB.open(this._dbName, this._dbVersion);
        openreq.onupgradeneeded = e => {
            this._db = openreq.result;
            const oldVersion = e.oldVersion ?? 0;
            const newVersion = e.newVersion ?? this._dbVersion;
            this.setupDB(oldVersion, newVersion);
        }
        openreq.onerror = () => this.onDBFail(openreq.error);
        openreq.onsuccess = () => {
            this._db = openreq.result;
            this._avaialble = true;
            this.ready();
        }
    }

    private onDBFail(exp: DOMException | null) {
        new MessageScreen(
            'No IndexedDB',
            `It seems that yor browser doesn't support IndexedDB, which is used to store your config and the sessions locally. This may be because your browser straight up doesn't support it
            or because you are in a private mode window. <b>Some browsers like Firefox don't allow IndexedDB access on private windows</b>.`
        );
        console.error(`Failed to create indexed DB, do your browser support it? ${exp?.code} : ${exp?.name} : ${exp?.stack}`);
        this.ready();
    }

    private setupDB(oldVersion: number, newVersion: number) {
        if (oldVersion < 1) {
            this._db.createObjectStore('sessions', {keyPath: 'name'});
        }
        if (oldVersion < 2) {
            this._db.createObjectStore('config', {keyPath: 'key'});
        }
    }

    private ready() {
        this._initialized = true;
        if (this.onReady) this.onReady();
    }

    get db() {
        return this._db;
    }

    get available() {
        return this._avaialble;
    }

    get initialized() {
        return this._initialized;
    }
}