
export class TextureUtils {

    static createWebGLTexture(gl: WebGL2RenderingContext) {
        let tempTex = gl.createTexture();
        if (!tempTex) throw `Failed to create texture`;
        gl.bindTexture(gl.TEXTURE_2D, tempTex);
        this.setDefaultTexturePreoperties(gl);
        return tempTex;
    }

    static setDefaultTexturePreoperties(gl: WebGL2RenderingContext) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

}