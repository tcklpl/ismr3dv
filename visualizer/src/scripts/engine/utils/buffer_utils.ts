
export class BufferUtils {

    static createBuffer(gl: WebGL2RenderingContext) {
        let tmpBuffer = gl.createBuffer();
        if (!tmpBuffer) throw `Failed to create buffer`;
        return tmpBuffer;
    }

    static createVAO(gl: WebGL2RenderingContext) {
        let tmpVao = gl.createVertexArray();
        if (!tmpVao) throw `Failed to create VAO`;
        return tmpVao;
    }

}