import { Mesh } from "../../engine/data_formats/mesh/mesh";
import { RenderableObject } from "../../engine/data_formats/renderable_object";
import { Material } from "../../engine/materials/material";
import { Shader } from "../../engine/shaders/shader";
import { Visualizer } from "../visualizer";

export class EarthRenderableObject extends RenderableObject {

    private _materialBindPoints: Map<string, WebGLUniformLocation> = new Map();

    constructor(id: number, mesh: Mesh, material: Material, shader: Shader) {
        super(id, mesh, material, shader);

        shader.bind();
        this._materialBindPoints.set('daymap', shader.assertGetUniform('u_map_day'));
        this._materialBindPoints.set('nightmap', shader.assertGetUniform('u_map_night'));
        this._materialBindPoints.set('clouds', shader.assertGetUniform('u_map_clouds'));
        this._materialBindPoints.set('normal', shader.assertGetUniform('u_map_normal'));
        this._materialBindPoints.set('specular', shader.assertGetUniform('u_map_specular'));
    }

    render(uniformConfiguration: () => void): void {
        this._shader.bind();
        this._material.bind(this._materialBindPoints);
        this.modelMatrix.bindUniform(Visualizer.instance.gl, this.u_model);
        uniformConfiguration();
        this._mesh.draw();
    }

}