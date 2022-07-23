import { Vec2 } from "../data_formats/vec/vec2";
import { BufferUtils } from "../utils/buffer_utils";
import { TextureUtils } from "../utils/texture_utils";

export class PingPongFramebuffer {

    private _resolution: Vec2;
    private _fbPing!: WebGLFramebuffer;
    private _fbPong!: WebGLFramebuffer;
    private _texPing!: WebGLTexture;
    private _texPong!: WebGLTexture;

    constructor(resolution: Vec2) {
        this._resolution = resolution;
        this.buildBuffers();
    }

    private clearBuffers() {
        gl.deleteFramebuffer(this._fbPing);
        gl.deleteFramebuffer(this._fbPong);
        gl.deleteTexture(this._texPing);
        gl.deleteTexture(this._texPong);
    }

    private buildBuffers() {
        this.clearBuffers();

        this._fbPing = BufferUtils.createFramebuffer(gl);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbPing);
        this._texPing = TextureUtils.createBufferTexture(gl, this._resolution.x, this._resolution.y);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texPing, 0);
        BufferUtils.assertFrameBufferCompletion(gl, 'Failed to create ping framebuffer');

        this._fbPong = BufferUtils.createFramebuffer(gl);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbPong);
        this._texPong = TextureUtils.createBufferTexture(gl, this._resolution.x, this._resolution.y);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texPong, 0);
        BufferUtils.assertFrameBufferCompletion(gl, 'Failed to create ping framebuffer');
    }

    changeResolution(newRes: Vec2) {
        if (newRes.equals(this._resolution)) return;
        this._resolution = newRes;
        this.buildBuffers();
    }

    get resolution() {
        return this._resolution;
    }

    get fbPing() {
        return this._fbPing;
    }

    get fbPong() {
        return this._fbPong;
    }

    get texPing() {
        return this._texPing;
    }

    get texPong() {
        return this._texPong;
    }

}