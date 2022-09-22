import { Entity } from "../../engine/data_formats/entity";
import { Mesh } from "../../engine/data_formats/mesh/mesh";
import { Material } from "../../engine/materials/material";
import { Shader } from "../../engine/shaders/shader";

export class SatelliteEntity extends Entity {

    private _materialBindPoints: Map<string, WebGLUniformLocation> = new Map();

    private _uSunPos: WebGLUniformLocation;

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

}