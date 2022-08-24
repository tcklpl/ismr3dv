import { Moment } from "./moment";
import { MomentColorer } from "./colorers/moment_buffering_colorer";
import { Vec2 } from "../../../engine/data_formats/vec/vec2";
import { TextureUtils } from "../../../engine/utils/texture_utils";
import { miInverseDistanceWeighting } from "./interpolation/mi_inverse_distance_weighting";
import { IMomentInterpEntry } from "./interpolation/i_moment_queue_entries";
import { MIStates, MomentInterpolator } from "./interpolation/interpolator";

export type MomentFreeingLocation = 'before' | 'after';

export class MomentBufferingManager {

    private _moments: Moment[] = [];

    private _currentIndex: number;
    // Total number, +1 because of the current moment
    private _maxBufferedMoments = 101;
    private _bufferBounds = new Vec2(-1, -1);
    private _currentTexture: WebGLTexture;

    private _bufferSize = new Vec2(500, 250);
    private _interpColorProvider = new MomentColorer(this._bufferSize);

    private _interpolator!: MomentInterpolator;

    private _momentWaitingForColor?: number;
    private _momentsToProcess = 0;

    constructor(currentIndex = 0) {
        this._currentIndex = currentIndex;
        this._currentTexture = TextureUtils.createBufferTexture(500, 250);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        this.setInterpolator(miInverseDistanceWeighting);
    }

    private killInterpolatorIfPresent() {
        if (!!this._interpolator) {
            this._interpolator.terminate();
        }
    }

    setInterpolator(interpFuncThread: (...args: any[]) => void) {
        this.killInterpolatorIfPresent();
        this._interpolator = new MomentInterpolator(interpFuncThread, this._bufferSize);
        this._interpolator.onMessage = m => this.onInterpolatorMessage(m);
        this._interpolator.onError = e => this.onInterpolatorError(e);
        this._interpolator.onStateChange(s => this.onInterpolatorStateChange(s));
    }

    replaceMoments(moments: Moment[], newIndex = 0) {
        this._moments = moments;
        this._currentIndex = newIndex;
        this.getMomentByIndex(this._currentIndex);
    }

    private onInterpolatorStateChange(state: MIStates) {
        switch(state) {
            case 'finished':
                visualizer.events.dispatchEvent('moment-interpolation-complete', this._bufferBounds);
                break;
            default:
                break;
        }
    }

    private onInterpolatorMessage(msg: MessageEvent) {
        const data = msg.data as {buffer: Float32Array, index: number};

        this._moments[data.index].bufferInterpolatedData = {
            size: this._bufferSize,
            data: data.buffer
        };

        this._interpColorProvider.enqueue({
            buffer: data.buffer,

            onColorCompletion: color => {
                this._moments[data.index].bufferColoredData = {
                    data: color,
                    size: this._bufferSize
                };

                // If this moment was selected previously but it wasn't buffered
                if (this._momentWaitingForColor === data.index) {
                    this.subTexAt(data.index);
                    this._momentWaitingForColor = undefined;
                }

                visualizer.events.dispatchEvent('moment-colored', data.index);
                this.momentProcessed();
            }
        });

        visualizer.events.dispatchEvent('moment-buffered', data.index);
    }

    private momentProcessed() {
        this._momentsToProcess--;
        if (this._momentsToProcess <= 0) {
            visualizer.events.dispatchEvent('all-moments-processed', this._bufferBounds);
        }
    }

    private onInterpolatorError(err: ErrorEvent) {
        console.error(err);
    }

    private clearBuffersAt(index: number, position: MomentFreeingLocation) {
        if (index < 0 || index > this._moments.length) {
            console.warn(`Clearing moment out of bounds: ${index} (${position}) on [0, ${this._moments.length}]`);
            return;
        }
        this._moments[index].bufferColoredData = undefined;
        this._moments[index].bufferInterpolatedData = undefined;
        visualizer.events.dispatchEvent('moment-freed', index, position);
    }

    private subTexAt(index: number) {
        if (!this._bufferBounds.containsAsMinMax(index)) {
            console.warn('Trying to subtex a non-buffered moment');
            return;
        }
        gl.bindTexture(gl.TEXTURE_2D, this._currentTexture);
        this._moments[index].texSubCurrent();
        visualizer.universeScene.ippSphere.currentTexture = this._currentTexture;
    }

    getMomentByIndex(index: number) {

        let hasBeenTexturedYet = false;
        const initialized = this._bufferBounds.x != -1 && this._bufferBounds.y != -1;

        if (this._bufferBounds.containsAsMinMax(index) && initialized) {
            this.subTexAt(index);
            hasBeenTexturedYet = true;

            if (index == this._currentIndex) return;
        }

        const difference = index - this._currentIndex;

        const bufferSideLength = (this._maxBufferedMoments - 1) / 2;
        const newLower = Math.max(0, index - bufferSideLength);
        const newHigher = Math.min(this._moments.length - 1, index + bufferSideLength);

        // If the new lower is different
        if (newLower > this._bufferBounds.x && initialized) {
            // then clear all the buffers that will be left out
            const start = Math.min(newLower, this._bufferBounds.x);
            const end = Math.max(newLower, this._bufferBounds.x);
            for (let i = start; i <= end; i++) {
                this.clearBuffersAt(i, 'before');
            }
        }

        // If the new higher is different
        if (newHigher < this._bufferBounds.y && initialized) {
            // then clear all the buffers that will be left out
            const start = Math.min(newHigher, this._bufferBounds.y);
            const end = Math.max(newHigher, this._bufferBounds.y);
            for (let i = end; i >= start; i--) {
                this.clearBuffersAt(i, 'after');
            }
        }

        // Now get the buffering bounds taking in consideration if we can reuse some interval of the
        // current buffers.
        let toBufferStart = 0, toBufferEnd = 0;
        // If the new index is higher
        if (difference > 0 && initialized) {
            toBufferStart = Math.max(newLower, this._bufferBounds.y);
            toBufferEnd = newHigher;
        } else if (difference < 0 && initialized) {
            toBufferStart = newLower;
            toBufferEnd = Math.min(newHigher, this._bufferBounds.x);
        } else {
            toBufferStart = newLower;
            toBufferEnd = newHigher;
        }

        // If the required moment was now buffered upon the request, it will be shown as soon as it's buffered and colored.
        if (!hasBeenTexturedYet) {
            this._momentWaitingForColor = index;
        }

        // Now buffer all the moments
        const dataToInterpolate = [];
        for (let i = toBufferStart; i <= toBufferEnd; i++) {
            dataToInterpolate.push(<IMomentInterpEntry> {
                data: this._moments[i].data,
                index: i
            });
        }
        this._momentsToProcess = (toBufferEnd - toBufferStart);
        this._interpolator.interpolateData(dataToInterpolate);

        this._currentIndex = index;
        this._bufferBounds.x = newLower;
        this._bufferBounds.y = newHigher;

        const alreadyBufferedStart = Math.max(newLower, toBufferStart);
        const alreadyBufferedEnd = Math.min(newHigher, toBufferEnd);

        visualizer.events.dispatchEvent('timeline-buffer-bounds-update', this._bufferBounds, new Vec2(alreadyBufferedStart, alreadyBufferedEnd));
    }

    get texture() {
        return this._currentTexture;
    }

}