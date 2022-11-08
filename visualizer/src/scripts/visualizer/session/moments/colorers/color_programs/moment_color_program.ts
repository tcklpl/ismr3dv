import { Vec2 } from "../../../../../engine/data_formats/vec/vec2";
import { Shader } from "../../../../../engine/shaders/shader";

export abstract class MomentColorProgram {
    
    private _shader: Shader;
    private _u_data: WebGLUniformLocation;
    private _u_min: WebGLUniformLocation;
    private _u_max: WebGLUniformLocation;
    private _name: string;
    private _description: string;
    private _cssClass: string;

    constructor(shaderName: string, name: string, description: string, cssClass: string) {
        this._name = name;
        this._description = description;
        this._cssClass = cssClass;
        this._shader = visualizer.shaderManager.assertGetShader(shaderName);
        this._shader.bind();
        this._u_data = this._shader.assertGetUniform('u_data');
        this._u_min = this._shader.assertGetUniform('u_min');
        this._u_max = this._shader.assertGetUniform('u_max');
        gl.uniform1i(this._u_data, 0);
    }

    colorBuffer(buffer: Float32Array, fb: WebGLFramebuffer, texIn: WebGLTexture, size: Vec2, bounds: Vec2) {
        const out = new Uint8Array(size.x * size.y * 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

        this._shader.bind();
        gl.uniform1f(this._u_min, bounds.x);
        gl.uniform1f(this._u_max, bounds.y);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texIn);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, size.x, size.y, gl.RED, gl.FLOAT, buffer);
        gl.viewport(0, 0, size.x, size.y);
        visualizer.engine.renderer.renderQuad();

        gl.readPixels(0, 0, size.x, size.y, gl.RGBA, gl.UNSIGNED_BYTE, out);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return out;
    }

    get name() {
        return this._name;
    }

    get description() {
        return this._description;
    }

    get cssClass() {
        return this._cssClass;
    }
}