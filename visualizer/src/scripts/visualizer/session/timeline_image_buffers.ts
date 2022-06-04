import { Vec2 } from "../../engine/data_formats/vec/vec2";
import { BufferUtils } from "../../engine/utils/buffer_utils";
import { TextureUtils } from "../../engine/utils/texture_utils";
import { Visualizer } from "../visualizer";

export class TimelineImageBuffers {

    private _gl = Visualizer.instance.gl;
    private _buffers: {tex: WebGLTexture, fb: WebGLFramebuffer}[] = [];
    private _nBuffers = 5;
    private _curBuffer = 0;

    private _curResolution: Vec2;

    constructor(resolution: Vec2) {
        this._curResolution = resolution;
        this.initializeBuffers();
    }

    private clearBuffers() {
        this._buffers.forEach(b => {
            this._gl.deleteFramebuffer(b.fb);
            this._gl.deleteTexture(b.tex);
        });
    }

    private initializeBuffers() {
        this.clearBuffers();
        for (let i = 0; i < this._nBuffers; i++) {
            const fb = BufferUtils.createFramebuffer(this._gl);
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, fb);
            const tex = TextureUtils.createBufferTexture(this._gl, this._curResolution.x, this._curResolution.y);
            this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, tex, 0);
            BufferUtils.assertFrameBufferCompletion(this._gl, `Failed to create timeline framebuffer #${i}`);
            this._buffers.push({
                fb: fb,
                tex: tex
            });
        }
    }

    private getPositionWithOffset(offset: number) {
        if (offset >= 0) {
            return (this._curBuffer + offset) % this._nBuffers;
        }
        let boundary = this._curBuffer + this._nBuffers;
        while (boundary < -offset) {
            boundary += this._nBuffers;
        }
        return (boundary + offset) % this._nBuffers;
    }

    moveNext() {
        this._curBuffer = this.getPositionWithOffset(1);
        return this.activeBuffer;
    }

    movePrevious() {
        this._curBuffer = this.getPositionWithOffset(-1);
        return this.activeBuffer;
    }

    getOffsettedBuffer(offset: number) {
        return this._buffers[this.getPositionWithOffset(offset)];
    }

    get allBuffers() {
        return this._buffers;
    }

    get bufferCount() {
        return this._nBuffers;
    }

    get activeBuffer() {
        return this._buffers[this._curBuffer];
    }

    get nextBuffer() {
        return this._buffers[this.getPositionWithOffset(1)];
    }

    get previousBuffer() {
        return this._buffers[this.getPositionWithOffset(-1)];
    }

    get resolution() {
        return this._curResolution;
    }

}