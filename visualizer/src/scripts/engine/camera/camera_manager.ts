import { GenericManager } from "../generic_manager";
import { Camera } from "./camera";

export class CameraManager extends GenericManager<Camera> {

    private _activeCamera?: Camera;

    setActiveCamera(cam?: Camera) {
        this._activeCamera = cam;
    }

    public get activeCamera() {
        return this._activeCamera;
    }
}