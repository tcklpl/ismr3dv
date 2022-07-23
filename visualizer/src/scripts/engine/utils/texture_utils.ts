import { EngineError } from "../errors/engine_error";

export class TextureUtils {

    static createWebGLTexture() {
        let tempTex = gl.createTexture();
        if (!tempTex) throw new TextureUtilsError('Failed to create texture');
        gl.bindTexture(gl.TEXTURE_2D, tempTex);
        this.setTexturePreoperties();
        return tempTex;
    }

    static setTexturePreoperties(filter = gl.LINEAR) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    }

    static createTextureFromImage(image: HTMLImageElement) {
        let tex = this.createWebGLTexture();
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        return tex;
    }

    static createBufferTexture(width: number, height: number) {
        const tex = this.createWebGLTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        return tex;
    }

    static createHDRBufferTexture(width: number, height: number) {
        const tex = this.createWebGLTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, null);
        this.setTexturePreoperties();
        return tex;
    }

    static create1DVec3TextureFromBuffer(buf: Float32Array) {
        const tex = this.createWebGLTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        this.setTexturePreoperties(gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB32F, buf.length / 3, 1, 0, gl.RGB, gl.FLOAT, buf);
        return tex;
    }

    static createCubemap(images: HTMLImageElement[]) {
        let tex = gl.createTexture();
        if (!tex) throw new TextureUtilsError('Failed to create cubemap texture');
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

        for (let i = 0; i < 6; i++) {
            // TEXTURE_CUBE_MAP_POSITIVE_X is the first one and all the other faces are increments
            gl.texImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]
            );
        }

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        return tex;
    }

}

class TextureUtilsError extends EngineError {
    constructor(description: string) {
        super('Texture Utils', description);
    }
}