import { Camera } from "../../engine/camera/camera";
import { Mat4 } from "../../engine/data_formats/mat/mat4";
import { Vec2 } from "../../engine/data_formats/vec/vec2";
import { Vec3 } from "../../engine/data_formats/vec/vec3";
import { Time } from "../../engine/time";
import { IFrameListener } from "../../engine/traits/i_frame_listener";
import { MUtils } from "../../engine/utils/math_utils";
import { IMouseListener } from "../io/i_mouse_listener";

export class MainCamera extends Camera implements IMouseListener, IFrameListener {

    private _phi: number = Math.PI / 2;
    private _theta: number = 0;

    private _deltaX: number = 0;
    private _deltaY: number = 0;
    private _deltaZ: number = 0;

    private _sensibility = 10;
    private _distance = 2;
    private _distanceBounds = new Vec2(1.2, 5);

    constructor() {
        super(new Vec3(-2, 0, 0), new Vec3(0, 1, 0));
        visualizer.engine.registerFrameListener(this);
        visualizer.io.mouse.registerListener(this);
        this.generateCameraMatrix();
        visualizer.registerPointerLockListener(l => this.onPointerLock(l));
    }

    update(): void {
        if (this._deltaX != 0 || this._deltaY != 0 || this._deltaZ != 0) {
            if (this._deltaX != 0) this._phi = MUtils.clamp(0.1, 179.9, this._phi + (this._deltaX * Time.deltaTime));
            if (this._deltaY != 0) this._distance = MUtils.clamp(this._distanceBounds.x, this._distanceBounds.y, this._distance + this._deltaY * Time.deltaTime);
            if (this._deltaZ != 0) this._theta = this._theta + (this._deltaZ * Time.deltaTime);

            this.generateCameraMatrix();
        }
    }

    generateCameraMatrix(): void {
        const phiRad = MUtils.degToRad(this._phi);
        const thetaRad = MUtils.degToRad(this._theta);
        this._pos.x = this._distance * Math.sin(phiRad) * Math.cos(thetaRad);
        this._pos.y = this._distance * Math.cos(phiRad);
        this._pos.z = this._distance * Math.sin(phiRad) * Math.sin(thetaRad);
        let mat = Mat4.lookAt(this._pos, Vec3.zero, this._up);
        this.cameraMatrix = mat;
    }

    onMouseMoveOffset(x: number, y: number) {
        if (!visualizer.pointerLocked) return;
        this._deltaZ = MUtils.clamp(-10, 10, x) * this._sensibility;
        this._deltaX = MUtils.clamp(-10, 10, y) * this._sensibility * -1;
    }

    onMouseScroll(dy: number) {
        if (!visualizer.pointerLocked) return;
        this._deltaY = dy * 0.005;
    }

    onMouseScrollStop() {
        this._deltaY = 0;
    }

    onPointerLock(l: boolean) {
        if (!l) {
            this._deltaX = 0;
            this._deltaY = 0;
            this._deltaZ = 0;
        }
    }

    onMouseStop() {
        this._deltaX = 0;
        this._deltaZ = 0;
    }

}