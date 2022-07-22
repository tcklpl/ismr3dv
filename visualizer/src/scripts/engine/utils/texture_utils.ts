import { EngineError } from "../errors/engine_error";

export class TextureUtils {

    static createWebGLTexture(gl: WebGL2RenderingContext) {
        let tempTex = gl.createTexture();
        if (!tempTex) throw new TextureUtilsError('Failed to create texture');
        gl.bindTexture(gl.TEXTURE_2D, tempTex);
        this.setTexturePreoperties(gl);
        return tempTex;
    }

    static setTexturePreoperties(gl: WebGL2RenderingContext, filter = gl.LINEAR) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    }

    static createTextureFromImage(gl: WebGL2RenderingContext, image: HTMLImageElement) {
        let tex = this.createWebGLTexture(gl);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        return tex;
    }

    static createBufferTexture(gl: WebGL2RenderingContext, width: number, height: number) {
        const tex = this.createWebGLTexture(gl);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        return tex;
    }

    static createHDRBufferTexture(gl: WebGL2RenderingContext, width: number, height: number) {
        const tex = this.createWebGLTexture(gl);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, null);
        this.setTexturePreoperties(gl);
        return tex;
    }

    static create1DVec3TextureFromBuffer(gl: WebGL2RenderingContext, buf: Float32Array) {
        const tex = this.createWebGLTexture(gl);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        this.setTexturePreoperties(gl, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB32F, buf.length / 3, 1, 0, gl.RGB, gl.FLOAT, buf);
        return tex;
    }

}

class TextureUtilsError extends EngineError {
    constructor(description: string) {
        super('Texture Utils', description);
    }
}