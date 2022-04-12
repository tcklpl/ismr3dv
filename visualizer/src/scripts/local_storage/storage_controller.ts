import { StorageType } from "./storage_type";

export class StorageController {

    private _maxSizeKb!: number;
    private _storageUsedByCategory: Map<StorageType, number> = new Map();

    constructor() {
        this.getStorageSize();
        this.getUsedStorage();
    }

    private getStorageSize() {
        
        if (!localStorage.getItem('cfg-ls-size')) {
            let i = 0;
            try {

                for (i = 0; i <= 10000; i += 250) {
                    localStorage.setItem('test', new Array(i * 1024 + 1).join('a'));
                }

            } catch (e) {
                localStorage.removeItem('test');
                localStorage.setItem('cfg-ls-size', `${i ? i - 250 : 0}`);
            }
        } else {
            try {
                Number(localStorage.getItem('cfg-ls-size'));
            } catch (e) {
                localStorage.removeItem('cfg-ls-size');
                this.getStorageSize();
            }
        }

        this._maxSizeKb = Number(localStorage.getItem('cfg-ls-size'));
    }

    private getUsedStorage() {

        const toRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i) as string;
            let prefix = key.split('-')[0];
            let typeFetch = Object.entries(StorageType).find(([k, v]) => v.toString() == prefix);
            if (!typeFetch) {
                console.warn(`Invalid local storage key: '${key}', removing it...`);
                toRemove.push(key);
                continue;
            }

            let type = typeFetch[1];
            if (!this._storageUsedByCategory.get(type)) {
                this._storageUsedByCategory.set(type, 0);
            }

            let currentSize = this._storageUsedByCategory.get(type) as number;
            currentSize += (localStorage.getItem(key) as string).length;
            this._storageUsedByCategory.set(type, currentSize);
        }

        toRemove.forEach(k => localStorage.removeItem(k));
    }

    /**
     * Saves a value to the local storage.
     * Will return true if it succeeds or false if there's not enough space.
     * 
     * @param type The type of storage to be used, currently there are 2: CONFIG and CACHE.
     * @param key The key to identify the value, will be prefixed by the storage type.
     * @param value The value to be saved.
     * @returns true if it was able to insert or false if there's not enough space in the storage.
     */
    set(type: StorageType, key: string, value: string) {
        let fullKey = `${type.toString()}-${key}`;

        let oldSize = 0;
        let alreadyPresent = localStorage.getItem(fullKey);
        if (alreadyPresent) {
            oldSize = alreadyPresent.length;
        }

        let sizeDiff = value.length - oldSize;
        if (this.totalUsedSizeBytes + sizeDiff > this._maxSizeKb * 1000) return false;

        let currentSize = this._storageUsedByCategory.get(type) as number;
        this._storageUsedByCategory.set(type, currentSize + sizeDiff);

        localStorage.setItem(fullKey, value);
        return true;
    }

    /**
     * Tries to get a value from the storage.
     * 
     * @param type The type of storage to be used, currently there are 2: CONFIG and CACHE.
     * @param key The key to identify the value, will be prefixed by the storage type.
     * @returns The value if it exists, or null otherwise.
     */
    get(type: StorageType, key: string) {
        let fullKey = `${type.toString()}-${key}`;

        return localStorage.getItem(fullKey);
    }

    /**
     * Removes (if it exists) the desired key from the storage.
     * 
     * @param type The type of storage to be used, currently there are 2: CONFIG and CACHE.
     * @param key The key to identify the value, will be prefixed by the storage type.
     */
    remove(type: StorageType, key: string) {
        let fullKey = `${type.toString()}-${key}`;

        let alreadyPresent = localStorage.getItem(fullKey);
        if (alreadyPresent) {
            let oldSize = alreadyPresent.length;

            let currentSize = this._storageUsedByCategory.get(type) as number;
            this._storageUsedByCategory.set(type, currentSize - oldSize);
        }

        localStorage.removeItem(fullKey);
    }

    /**
     * Removes everything from one category from the storage.
     * 
     * @param type The type of storage to be used, currently there are 2: CONFIG and CACHE.
     */
    removeCategory(type: StorageType) {
        let catPrefix = type.toString();
        let toRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i) as string;
            let prefix = key.split('-')[0];
            if (prefix == catPrefix)
                toRemove.push(key);
        }

        toRemove.forEach(r => localStorage.removeItem(r));
        this._storageUsedByCategory.set(type, 0);
    }

    /**
     * Clears all the storage.
     */
    nuke() {
        localStorage.clear();
        this._storageUsedByCategory = new Map();
        this.getUsedStorage();
    }

    get maxSizeKb() {
        return this._maxSizeKb;
    }

    get totalUsedSizeBytes() {
        let total = 0;
        this._storageUsedByCategory.forEach(v => total += v);
        return total;
    }

    get totalFreeSpaceBytes() {
        return this._maxSizeKb * 1000 - this.totalUsedSizeBytes;
    }

    get storagePerCategory() {
        return this._storageUsedByCategory;
    }

}