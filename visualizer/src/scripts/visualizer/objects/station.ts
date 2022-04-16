import { Mesh } from "../../engine/data_formats/mesh/mesh";
import { RenderableObject } from "../../engine/data_formats/renderable_object";
import { Vec3 } from "../../engine/data_formats/vec/vec3";
import { Material } from "../../engine/materials/material";
import { Shader } from "../../engine/shaders/shader";
import { Visualizer } from "../visualizer";

export class StationRenderableObject extends RenderableObject {

    private _stationId!: number;
    private _color: Vec3 = new Vec3(1, 1, 1);
    private _colorUniform: WebGLUniformLocation;

    constructor(id: number, mesh: Mesh, material: Material, shader: Shader) {
        super(id, mesh, material, shader);
        this._shader.bind();
        this._colorUniform = shader.assertGetUniform('u_color');
    }

    render(uniformConfiguration: () => void): void {
        this._shader.bind();
        this._color.bindUniform(Visualizer.instance.gl, this._colorUniform);
        this.modelMatrix.bindUniform(Visualizer.instance.gl, this.u_model);
        uniformConfiguration();
        this._mesh.draw();
    }

    get stationId() {
        return this._stationId;
    }

    set stationId(id: number) {
        this._stationId = id;
    }

}