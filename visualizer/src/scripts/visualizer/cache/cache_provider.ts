import { StorageType } from "../../local_storage/storage_type";
import { IStorageKey } from "./i_storage_key";

export abstract class CacheProvider<T, K extends IStorageKey> {

    private _storage = visualizer.storageController;
    private _storageKey: string;

    private _data: Map<K, T[]> = new Map();

    constructor(storageKey: string) {
        this._storageKey = storageKey;
        this.load();
    }

    clear() {
        this._data = new Map();
        this._storage.remove(StorageType.CACHE, this._storageKey);
    }

    save() {
        const keyedStorage = new Map<string, T[]>();
        this._data.forEach((v, k) => keyedStorage.set(k.keyedString, v));
        if (!this._storage.set(StorageType.CACHE, this._storageKey, JSON.stringify(Object.fromEntries(keyedStorage)))) console.warn('Failed to save cache: storage is full');
    }

    load() {
        let storageData = this._storage.get(StorageType.CACHE, this._storageKey);
        if (!storageData) return;
        const keyedStorage: Map<string, T[]> = new Map(Object.entries(JSON.parse(storageData)));
        this._data = new Map();
        keyedStorage.forEach((v, k) => this._data.set(this.parseKeyedString(k), v));
    }

    protected abstract parseKeyedString(str: string): K;

    protected cache(key: K, value: T[]) {
        if (visualizer.serverInfo.showcase_mode) return;
        this._data.set(key, value);
        this.save();
    }

    get cachedData() {
        return this._data;
    }

}