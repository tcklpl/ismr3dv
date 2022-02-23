
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
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    static createTextureFromImage(gl: WebGL2RenderingContext, image: HTMLImageElement) {
        let tex = this.createWebGLTexture(gl);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        return tex;
    }

}