import { Keyboard } from "./keyboard";
import { Mouse } from "./mouse";

export class VisualizerIO {

    private _mouse = new Mouse();
    private _keyboard = new Keyboard();

    get mouse() {
        return this._mouse;
    }

    get keyboard() {
        return this._keyboard;
    }

}