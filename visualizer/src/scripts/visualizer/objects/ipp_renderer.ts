import { Entity } from "../../engine/data_formats/entity";
import { Mesh } from "../../engine/data_formats/mesh/mesh";
import { Material } from "../../engine/materials/material";
import { Shader } from "../../engine/shaders/shader";

export class IPPSphereEntity extends Entity {

    currentTexture?: WebGLTexture;
    currentChannel: number = 0;

    private _opacity: number = 0.5;

    private _uImage: WebGLUniformLocation;
    private _uOpacity: WebGLUniformLocation;

    constructor(id: number, mesh: Mesh, material: Material, shader: Shader) {
        super(id, mesh, material, shader);

        shader.bind();
        this._uImage = shader.assertGetUniform('u_ipp');
        this._uOpacity = shader.assertGetUniform('u_opacity');
        this.transparent = true;
    }

    render(uniformConfiguration: () => void): void {
        // don't render if no texture is active
        if (!this.currentTexture) return;

        this.shader.bind();
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(this._uImage, 0);
        gl.uniform1f(this._uOpacity, this._opacity);
        gl.bindTexture(gl.TEXTURE_2D, this.currentTexture as WebGLTexture);

        this.modelMatrix.bindUniform(gl, this.u_model);
        uniformConfiguration();
        this._mesh.draw();
    }

    get opacity() {
        return this._opacity;
    }

    set opacity(o: number) {
        if (o < 0 || o > 1) {
            console.warn(`Invalid opacity: ${o}`);
            return;
        }
        this._opacity = o;
    }
    
}