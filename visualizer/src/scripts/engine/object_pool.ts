
export class ObjectPool {

    private _currentId = 0;

    private requestId() {
        return this._currentId++;
    }

    fetchAndCreateObjectFrom(meshName: string, materialName: string, shaderName: string) {
        
    }

}