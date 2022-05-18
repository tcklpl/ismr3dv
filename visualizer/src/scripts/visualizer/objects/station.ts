import { Mat4 } from "../../engine/data_formats/mat/mat4";
import { Mesh } from "../../engine/data_formats/mesh/mesh";
import { RenderableObject } from "../../engine/data_formats/renderable_object";
import { UBoolean } from "../../engine/data_formats/uniformable_basics/u_boolean";
import { Vec2 } from "../../engine/data_formats/vec/vec2";
import { Vec3 } from "../../engine/data_formats/vec/vec3";
import { Vec4 } from "../../engine/data_formats/vec/vec4";
import { IInteractable } from "../../engine/interactions/i_interactable";
import { Material } from "../../engine/materials/material";
import { Shader } from "../../engine/shaders/shader";
import { IStationInfo } from "../api/formats/i_station_info";
import { Visualizer } from "../visualizer";

export class StationRenderableObject extends RenderableObject implements IInteractable {

    private _stationInfo!: IStationInfo;
    private _color: Vec3 = new Vec3(1, 1, 1);
    private _applyBloom = new UBoolean(false);
    private _colorLocked = false;
    private _colorUniform: WebGLUniformLocation;
    private _applyBloomUniform: WebGLUniformLocation;

    constructor(id: number, mesh: Mesh, material: Material, shader: Shader) {
        super(id, mesh, material, shader);
        this._shader.bind();
        this._colorUniform = shader.assertGetUniform('u_color');
        this._applyBloomUniform = shader.assertGetUniform('u_apply_bloom');
    }

    render(uniformConfiguration: () => void): void {
        this._shader.bind();
        this._color.bindUniform(Visualizer.instance.gl, this._colorUniform);
        this._applyBloom.bindUniform(Visualizer.instance.gl, this._applyBloomUniform);
        this.modelMatrix.bindUniform(Visualizer.instance.gl, this.u_model);
        uniformConfiguration();
        this._mesh.draw();
    }

    onMouseHover() {
        this.color = new Vec3(1, 0, 0);
        
        const pos = new Vec4(this.mesh.centroid.x, this.mesh.centroid.y, this.mesh.centroid.z, 1);
        const model = this.modelMatrix;
        const view = Visualizer.instance.cameraManager.activeCamera?.matrix as Mat4;
        const projection = Visualizer.instance.engine.renderer.perspectiveProjectionMat4;

        const ndc = projection.multiplyByVec4(view.multiplyByVec4(model.multiplyByVec4(pos)));
        Visualizer.instance.ui.canvas.showStationInfoPopup(this.stationInfo, new Vec2(ndc.x / ndc.w, ndc.y / ndc.w));
        Visualizer.instance.universeScene.isHoveringOverStation = true;
    }

    onMouseLeave() {
        this.color = new Vec3(1, 1, 1);
        Visualizer.instance.ui.canvas.hideStationInfoPopup();
        Visualizer.instance.universeScene.isHoveringOverStation = false;
    }

    onMouseLeftClick() {
        Visualizer.instance.session?.notifyStationClick(this);
    }

    get stationInfo() {
        return this._stationInfo;
    }

    set stationInfo(s: IStationInfo) {
        this._stationInfo = s;
    }

    get color() {
        return this._color;
    }

    set color(c: Vec3) {
        if (this._colorLocked) return;
        this._color = c;
    }

    get colorLocked() {
        return this._colorLocked;
    }

    set colorLocked(locked: boolean) {
        this._colorLocked = locked;
    }

    get applyBloom() {
        return this._applyBloom.value;
    }

    set applyBloom(value: boolean) {
        this._applyBloom.value = value;
    }

}