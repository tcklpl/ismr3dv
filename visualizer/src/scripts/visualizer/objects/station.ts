import { Mat4 } from "../../engine/data_formats/mat/mat4";
import { Mesh } from "../../engine/data_formats/mesh/mesh";
import { RenderableObject } from "../../engine/data_formats/renderable_object";
import { Vec2 } from "../../engine/data_formats/vec/vec2";
import { Vec4 } from "../../engine/data_formats/vec/vec4";
import { IInteractable } from "../../engine/interactions/i_interactable";
import { Material } from "../../engine/materials/material";
import { Shader } from "../../engine/shaders/shader";
import { IStationInfo } from "../api/formats/i_station_info";
import { StationColors } from "../session/station_colors";
import { Visualizer } from "../visualizer";

export class StationRenderableObject extends RenderableObject implements IInteractable {

    private _stationInfo!: IStationInfo;
    private _color = StationColors.IDLE;
    private _colorLocked = false;
    private _colorUniform: WebGLUniformLocation;
    private _applyBloomUniform: WebGLUniformLocation;

    constructor(id: number, mesh: Mesh, material: Material, shader: Shader) {
        super(id, mesh, material, shader);
        this.shader.bind();
        this._colorUniform = shader.assertGetUniform('u_color');
        this._applyBloomUniform = shader.assertGetUniform('u_apply_bloom');
    }

    render(uniformConfiguration: () => void): void {
        this.shader.bind();
        this._color.color.bindUniform(gl, this._colorUniform);
        this._color.bloom.bindUniform(gl, this._applyBloomUniform);
        this.modelMatrix.bindUniform(gl, this.u_model);
        uniformConfiguration();
        this._mesh.draw();
    }

    onMouseHover() {
        this.color = StationColors.HOVER;
        
        const pos = new Vec4(this.mesh.centroid.x, this.mesh.centroid.y, this.mesh.centroid.z, 1);
        const model = this.modelMatrix;
        const view = Visualizer.instance.cameraManager.activeCamera?.matrix as Mat4;
        const projection = Visualizer.instance.engine.renderer.perspectiveProjectionMat4;

        const ndc = projection.multiplyByVec4(view.multiplyByVec4(model.multiplyByVec4(pos)));
        Visualizer.instance.ui.canvas.showStationInfoPopup(this.stationInfo, new Vec2(ndc.x / ndc.w, ndc.y / ndc.w));
        Visualizer.instance.universeScene.isHoveringOverStation = true;
    }

    onMouseLeave() {
        this.color = StationColors.IDLE;
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

    set color(c: StationColors) {
        if (this._colorLocked) return;
        this._color = c;
    }

    get colorLocked() {
        return this._colorLocked;
    }

    set colorLocked(locked: boolean) {
        this._colorLocked = locked;
    }

}