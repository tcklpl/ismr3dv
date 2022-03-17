import { GenericManager } from "../generic_manager";
import { Scene } from "./scene";

export class SceneManager extends GenericManager<Scene> {

    private _active?: Scene;

    getByName(name: string) {
        return this.allRegistered.find(x => x.name == name);
    }

    get active(): Scene | undefined {
        return this._active;
    }

    set active(a: Scene | undefined) {
        this._active = a;
    }

}