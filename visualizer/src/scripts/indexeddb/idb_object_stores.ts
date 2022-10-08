
export class IDBObjStore {

    public static SESSION = new IDBObjStore('sessions', 'name');
    public static CONFIG = new IDBObjStore('config', 'key');

    private _name: string;
    private _key: string;

    private constructor(name: string, key: string) {
        this._name = name;
        this._key = key;
    }

    get name() {
        return this._name;
    }

    get key() {
        return this._key;
    }

}