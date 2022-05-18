import { IMouseListener } from "../../visualizer/io/i_mouse_listener";
import { Visualizer } from "../../visualizer/visualizer";

export class InteractionManager implements IMouseListener {

    private _objManager = Visualizer.instance.objectManager;

    private _currentId: number = -1;
    private _currentSelectable: any;

    constructor() {
        Visualizer.instance.io.mouse.registerListener(this);
    }
    
    updateIdUnderMouse(newId: number) {
        if (newId == this._currentId) return;

        const newObj = this._objManager.allPiakcableObjects.find(x => x.id == newId);

        if (this._currentId > 0) {
            if (this._currentSelectable.onMouseLeave) this._currentSelectable.onMouseLeave();
        }
        
        this._currentSelectable = newObj;
        this._currentId = newId;

        if (!newObj) return;

        if ((newObj as any).onMouseHover) (newObj as any).onMouseHover();
    }

    onMouseLeftClick() {
        if (this._currentId > 0) {
            if (this._currentSelectable.onMouseLeftClick) this._currentSelectable.onMouseLeftClick();
        }
    }

    get isHoveringOverASelectable() {
        return this._currentId > 0;
    }

}