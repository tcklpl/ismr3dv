import { Camera } from "../../engine/camera/camera";
import { Mat4 } from "../../engine/data_formats/mat/mat4";
import { Vec2 } from "../../engine/data_formats/vec/vec2";
import { Vec3 } from "../../engine/data_formats/vec/vec3";
import { Time } from "../../engine/time";
import { IFrameListener } from "../../engine/traits/i_frame_listener";
import { MUtils } from "../../engine/utils/math_utils";
import { IMouseListener } from "../io/i_mouse_listener";
import { Visualizer } from "../visualizer";

export class MainCamera extends Camera implements IMouseListener, IFrameListener {

    private _currentRotationX: number = 0;
    private _currentRotationZ: number = 0;

    private _deltaX: number = 0;
    private _deltaY: number = 0;
    private _deltaZ: number = 0;

    private _sensibility = 50000;
    private _distance = 2;
    private _distanceBounds = new Vec2(1.2, 5);

    constructor() {
        super(new Vec3(-2, 0, 0), new Vec3(0, 1, 0));
        Visualizer.instance.engine.registerFrameListener(this);
        Visualizer.instance.io.mouse.registerListener(this);
        this.generateCameraMatrix();
    }

    update(): void {
        if (this._deltaX != 0 || this._deltaY != 0 || this._deltaZ != 0) {
            if (this._deltaX != 0) this._currentRotationX = this._currentRotationX + (this._deltaX * Time.deltaTime);
            if (this._deltaY != 0) this._distance = MUtils.clamp(this._distanceBounds.x, this._distanceBounds.y, this._distance + this._deltaY * Time.deltaTime);
            if (this._deltaZ != 0) this._currentRotationZ = this._currentRotationZ + (this._deltaZ * Time.deltaTime);

            this.generateCameraMatrix();
        }
    }

    generateCameraMatrix(): void {
        let mat = Mat4.identity();
        mat.yRotate(MUtils.degToRad(this._currentRotationX));
        mat.xRotate(MUtils.degToRad(this._currentRotationZ));
        mat.translate(0, 0, this._distance);
        this._cameraMatrix = Mat4.inverse(mat);
        this._cameraMatrixNoTranslation = this._cameraMatrix.topLeftCornerTo3x3().toMat4();
    }

    onMouseMoveOffset(x: number, y: number) {
        if (!Visualizer.instance.pointerLocked) return;
        this._deltaX = MUtils.clamp(-5, 5, x) * this._sensibility;
        this._deltaZ = MUtils.clamp(-5, 5, y) * this._sensibility;
    }

    onMouseScroll(dy: number) {
        if (!Visualizer.instance.pointerLocked) return;
        this._deltaY = dy * 0.005;
    }

    onMouseScrollStop() {
        this._deltaY = 0;
    }

    onMouseStop() {
        this._deltaX = 0;
        this._deltaZ = 0;
    }

}