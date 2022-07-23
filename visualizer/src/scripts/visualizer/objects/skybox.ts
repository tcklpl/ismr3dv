import { Material } from "../../engine/materials/material";
import { Shader } from "../../engine/shaders/shader";
import { Visualizer } from "../visualizer";

export class SkyboxRenderableObject {

    private _shader: Shader;
    private _material: Material;
    private _materialBindPoints: Map<string, WebGLUniformLocation> = new Map();

    private _u_view: WebGLUniformLocation;
    private _u_projection: WebGLUniformLocation;

    constructor(material: Material, shader: Shader) {
        this._shader = shader;
        this._material = material;
        shader.bind();
        this._materialBindPoints.set('diffuse', shader.assertGetUniform('u_skybox'));
        this._u_view = shader.assertGetUniform('u_view');
        this._u_projection = shader.assertGetUniform('u_projection');
    }

    render(uniformConfiguration: () => void): void {
        this._shader.bind();
        this._material.bind(this._materialBindPoints);
        uniformConfiguration();
        Visualizer.instance.engine.renderer.renderSkybox();
    }

    get u_view() {
        return this._u_view;
    }

    get u_projection() {
        return this._u_projection;
    }
    
}