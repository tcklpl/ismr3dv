import { Vec2 } from "../../engine/data_formats/vec/vec2";
import { BufferUtils } from "../../engine/utils/buffer_utils";
import { TextureUtils } from "../../engine/utils/texture_utils";

export class TimelineImageBuffers {

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
            gl.deleteFramebuffer(b.fb);
            gl.deleteTexture(b.tex);
        });
    }

    private initializeBuffers() {
        this.clearBuffers();
        for (let i = 0; i < this._nBuffers; i++) {
            const fb = BufferUtils.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            const tex = TextureUtils.createBufferTexture(this._curResolution.x, this._curResolution.y);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            BufferUtils.assertFrameBufferCompletion(`Failed to create timeline framebuffer #${i}`);
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