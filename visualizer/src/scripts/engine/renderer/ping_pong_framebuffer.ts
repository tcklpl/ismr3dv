import { Visualizer } from "../../visualizer/visualizer";
import { Vec2 } from "../data_formats/vec/vec2";
import { BufferUtils } from "../utils/buffer_utils";
import { TextureUtils } from "../utils/texture_utils";

export class PingPongFramebuffer {

    private _gl = Visualizer.instance.gl;
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
        this._gl.deleteFramebuffer(this._fbPing);
        this._gl.deleteFramebuffer(this._fbPong);
        this._gl.deleteTexture(this._texPing);
        this._gl.deleteTexture(this._texPong);
    }

    private buildBuffers() {
        this.clearBuffers();

        this._fbPing = BufferUtils.createFramebuffer(this._gl);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._fbPing);
        this._texPing = TextureUtils.createBufferTexture(this._gl, this._resolution.x, this._resolution.y);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._texPing, 0);
        BufferUtils.assertFrameBufferCompletion(this._gl, 'Failed to create ping framebuffer');

        this._fbPong = BufferUtils.createFramebuffer(this._gl);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._fbPong);
        this._texPong = TextureUtils.createBufferTexture(this._gl, this._resolution.x, this._resolution.y);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._texPong, 0);
        BufferUtils.assertFrameBufferCompletion(this._gl, 'Failed to create ping framebuffer');
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