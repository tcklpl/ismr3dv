import { Vec2 } from "../../../../engine/data_formats/vec/vec2";
import { IFrameListener } from "../../../../engine/traits/i_frame_listener";
import { BufferUtils } from "../../../../engine/utils/buffer_utils";
import { TextureUtils } from "../../../../engine/utils/texture_utils";
import { IMomentColorQueueEntry } from "../interpolation/i_moment_queue_entries";
import { MomentColorRainbow } from "./color_programs/rainbow";

export type MomentColorerStatus = 'idle' | 'working';

export class MomentColorer implements IFrameListener {

    private _fb: WebGLFramebuffer;
    private _texIn: WebGLTexture;
    private _texOut: WebGLTexture;
    
    private _bufferSize: Vec2;
    private _selectedColorProgram = new MomentColorRainbow();

    private _queue: IMomentColorQueueEntry[] = [];
    private _status: MomentColorerStatus = 'idle';

    constructor(bufferSize: Vec2) {
        this._bufferSize = bufferSize;
        this._fb = BufferUtils.createFramebuffer();
        this._texIn = TextureUtils.createR32FTexture(bufferSize.x, bufferSize.y, gl.NEAREST);
        this._texOut = TextureUtils.createBufferTexture(bufferSize.x, bufferSize.y, gl.NEAREST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texOut, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        visualizer.engine.registerFrameListener(this);
    }

    update(): void {
        // Do nothing if the queue is empty
        if (this._queue.length == 0) return;

        // get the first element on the queue
        const entry = this._queue.shift() as IMomentColorQueueEntry;

        const out = this._selectedColorProgram.colorBuffer(entry.buffer, this._fb, this._texIn, this._bufferSize);

        // notify the entry that it's interpolation is complete
        entry.onColorCompletion(out);

        if (this._queue.length == 0) this._status = 'idle';
    }

    enqueue(entry: IMomentColorQueueEntry) {
        this._queue.push(entry);
        this._status = 'working';
    }

    clearQueue() {
        this._queue = [];
        this._status = 'idle';
    }

    get status() {
        return this._status;
    }

}