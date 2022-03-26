
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

    static createFramebuffer(gl: WebGL2RenderingContext) {
        let tempBuf = gl.createFramebuffer();
        if (!tempBuf) throw `Failed to create framebuffer`;
        return tempBuf;
    }

    static createRenderbuffer(gl: WebGL2RenderingContext) {
        let tempBuf = gl.createRenderbuffer();
        if (!tempBuf) throw `Failed to create framebuffer`;
        return tempBuf;
    }

    static createQuadVAO(gl: WebGL2RenderingContext) {
        const quadCoords = new Float32Array([
            // positions     uvs
            -1.0,  1.0, 0.0, 0.0, 1.0,
            -1.0, -1.0, 0.0, 0.0, 0.0,
             1.0,  1.0, 0.0, 1.0, 1.0,
             1.0, -1.0, 0.0, 1.0, 0.0,   
        ]);

        const vao = this.createVAO(gl);
        const buffer = this.createBuffer(gl);
        
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, quadCoords, gl.STATIC_DRAW);
        
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * 4, 0); // float is 4 bytes
        gl.enableVertexAttribArray(0);

        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * 4, 3 * 4); // float is 4 bytes
        gl.enableVertexAttribArray(1);

        return vao;
    }

}