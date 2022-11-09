import { Entity } from "../../engine/data_formats/entity";
import { Mat4 } from "../../engine/data_formats/mat/mat4";
import { Mesh } from "../../engine/data_formats/mesh/mesh";
import { Vec2 } from "../../engine/data_formats/vec/vec2";
import { Vec4 } from "../../engine/data_formats/vec/vec4";
import { IInteractable } from "../../engine/interactions/i_interactable";
import { Material } from "../../engine/materials/material";
import { Shader } from "../../engine/shaders/shader";

export interface ISatInfo {
    name: string;
    value: number;
}

export class SatelliteEntity extends Entity implements IInteractable {

    private _materialBindPoints: Map<string, WebGLUniformLocation> = new Map();

    private _uSunPos: WebGLUniformLocation;
    
    curInfo: ISatInfo = {
        name: '',
        value: 0
    };

    constructor(id: number, mesh: Mesh, material: Material, shader: Shader) {
        super(id, mesh, material, shader);

        shader.bind();
        this._materialBindPoints.set('diffuse', shader.assertGetUniform('u_map_diffuse'));
        this._materialBindPoints.set('specular', shader.assertGetUniform('u_map_specular'));

        this._uSunPos = shader.assertGetUniform('u_sun_position');
    }

    render(uniformConfiguration: () => void): void {
        this.shader.bind();
        this._material.bind(this._materialBindPoints);

        const universe = visualizer.universeScene;

        universe.sun.position.bindUniform(gl, this._uSunPos);

        this.modelMatrix.bindUniform(gl, this.u_model);
        uniformConfiguration();
        this._mesh.draw();
    }

    onMouseHover() {
        const pos = new Vec4(this.mesh.centroid.x, this.mesh.centroid.y, this.mesh.centroid.z, 1);
        const model = this.modelMatrix;
        const view = visualizer.cameraManager.activeCamera?.viewMat as Mat4;
        const projection = visualizer.engine.renderer.perspectiveProjectionMat4;

        const ndc = projection.multiplyByVec4(view.multiplyByVec4(model.multiplyByVec4(pos)));
        visualizer.ui.canvas.showSatelliteInfoPopup(this.curInfo, new Vec2(ndc.x / ndc.w, ndc.y / ndc.w));

        this.outline = true;
    }

    onMouseLeave() {
        visualizer.ui.canvas.hideSatelliteInfoPopup();

        this.outline = false;
    }

}