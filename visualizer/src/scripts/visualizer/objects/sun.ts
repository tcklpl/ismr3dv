import { Mesh } from "../../engine/data_formats/mesh/mesh";
import { RenderableObject } from "../../engine/data_formats/renderable_object";
import { Material } from "../../engine/materials/material";
import { Shader } from "../../engine/shaders/shader";

export class SunRenderableObject extends RenderableObject {

    private _materialBindPoints: Map<string, WebGLUniformLocation> = new Map();

    constructor(id: number, mesh: Mesh, material: Material, shader: Shader) {
        super(id, mesh, material, shader);

        shader.bind();
        this._materialBindPoints.set('diffuse', shader.assertGetUniform('u_map_diffuse'));
    }

    render(uniformConfiguration: () => void): void {
        this.shader.bind();
        this._material.bind(this._materialBindPoints);
        this.modelMatrix.bindUniform(gl, this.u_model);
        uniformConfiguration();
        this._mesh.draw();
    }

}