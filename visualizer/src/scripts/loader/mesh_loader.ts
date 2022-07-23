import { AsyncUtils } from "../engine/utils/async_utils";
import { OBJUtils } from "../engine/utils/obj_utils";
import { GenericLoader } from "./generic_loader";
import { IMeshLoadlist } from "./mesh_loadlist";

interface IMeshSource {
    name: string;
    objSource: string;
}

export class MeshLoader extends GenericLoader {
    
    private _loadlist!: IMeshLoadlist;
    private _meshSources: IMeshSource[] = [];
    private _meshManager = visualizer.meshManager;

    protected initialize(): void {
        this._loadlist = this._source as IMeshLoadlist;
    }

    load(): void {
        
        this._loadlist.meshes.forEach(m => {

            AsyncUtils.getUrlAs(`meshes/${m.obj}`, (ret: string) => {
                this._meshSources.push({
                    name: m.name,
                    objSource: ret
                });
                this.notifyLoadedMesh();
            });

        });
    }

    notifyLoadedMesh() {
        if (this._meshSources.length == this._loadlist.meshes.length) this.onLoad();
    }

    construct() {
        this._meshSources.forEach(s => {
            const submeshes = OBJUtils.loadWavefrontObj(s.objSource);
            submeshes.forEach(sm => {
                this._meshManager.register(sm);
            });
        });
        this.onConstruct();
    }
    
}