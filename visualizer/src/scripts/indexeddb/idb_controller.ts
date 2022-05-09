import { IDBObjStore } from "./idb_object_stores";
import { IDBConnection } from "./idb_connection";

export class IDBController<T> {

    private _con: IDBConnection;
    private _os: IDBObjStore;

    constructor(con: IDBConnection, os: IDBObjStore) {
        this._con = con;
        this._os = os;
    }

    private getObjectStore(type: IDBTransactionMode) {
        const transaction = this._con.db.transaction(this._os.name, type);
        return transaction.objectStore(this._os.name);
    }

    add(value: T) {
        return new Promise<void>((resolve, reject) => {
            const objectStore = this.getObjectStore('readwrite');
            const request = objectStore.add(value);
            request.onsuccess = () => resolve();
            request.onerror = () => reject();
        }); 
    }

    put(value: T) {
        return new Promise<void>((resolve, reject) => {
            const objectStore = this.getObjectStore('readwrite');
            const request = objectStore.put(value);
            request.onsuccess = () => resolve();
            request.onerror = () => reject();
        }); 
    }

    fetchAll() {
        return new Promise<T[]>((resolve, reject) => {
            const objectStore = this.getObjectStore('readonly');
            const request = objectStore.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject();
        }); 
    }

    remove(value: T) {
        return new Promise<void>((resolve, reject) => {
            const objectStore = this.getObjectStore('readwrite');
            const request = objectStore.delete((value as any)[this._os.key]);
            request.onsuccess = () => resolve();
            request.onerror = () => reject();
        }); 
    }
}