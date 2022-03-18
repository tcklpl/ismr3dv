import { Mouse } from "./mouse";

export class VisualizerIO {

    private _mouse = new Mouse();

    get mouse() {
        return this._mouse;
    }

}