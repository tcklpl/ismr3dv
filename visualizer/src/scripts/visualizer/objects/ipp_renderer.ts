import { Entity } from "../../engine/data_formats/entity";
import { Mesh } from "../../engine/data_formats/mesh/mesh";
import { Material } from "../../engine/materials/material";
import { Shader } from "../../engine/shaders/shader";

export class IPPSphereEntity extends Entity {

    currentTexture?: WebGLTexture;
    currentChannel: number = 0;

    private _uImage: WebGLUniformLocation;
    private _uChannel: WebGLUniformLocation;

    constructor(id: number, mesh: Mesh, material: Material, shader: Shader) {
        super(id, mesh, material, shader);

        shader.bind();
        this._uImage = shader.assertGetUniform('u_ipp');
        this._uChannel = shader.assertGetUniform('u_channel');
        this.transparent = true;
    }

    render(uniformConfiguration: () => void): void {
        // don't render if no texture is active
        if (!this.currentTexture) return;

        this.shader.bind();
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(this._uImage, 0);
        gl.bindTexture(gl.TEXTURE_2D, this.currentTexture as WebGLTexture);
        
        gl.uniform1i(this._uChannel, this.currentChannel);

        this.modelMatrix.bindUniform(gl, this.u_model);
        uniformConfiguration();
        this._mesh.draw();
    }
    
}