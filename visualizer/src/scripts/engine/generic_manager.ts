
export abstract class GenericManager<T> {

    private _registeredObjects: T[] = [];

    register(item: T) {
        this._registeredObjects.push(item);
    }

    public get allRegistered() {
        return this._registeredObjects;
    }

}