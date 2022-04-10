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

        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i) as string;
            let prefix = key.split('-')[0];
            let typeFetch = Object.entries(StorageType).find(([k, v]) => v.toString() == prefix);
            if (!typeFetch) throw `Invalid local storage key: '${key}'`;

            let type = typeFetch[1];
            if (!this._storageUsedByCategory.get(type)) {
                this._storageUsedByCategory.set(type, 0);
            }

            let currentSize = this._storageUsedByCategory.get(type) as number;
            currentSize += (localStorage.getItem(key) as string).length;
            this._storageUsedByCategory.set(type, currentSize);
        }
    }

    set(type: StorageType, key: string, value: string) {
        let fullKey = `${type.toString()}-${key}`;

        let oldSize = 0;
        let alreadyPresent = localStorage.getItem(fullKey);
        if (alreadyPresent) {
            oldSize = alreadyPresent.length;
        }

        let currentSize = this._storageUsedByCategory.get(type) as number;
        this._storageUsedByCategory.set(type, currentSize - oldSize + value.length);

        localStorage.setItem(fullKey, value);
    }

    get(type: StorageType, key: string) {
        let fullKey = `${type.toString()}-${key}`;

        return localStorage.getItem(fullKey);
    }

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