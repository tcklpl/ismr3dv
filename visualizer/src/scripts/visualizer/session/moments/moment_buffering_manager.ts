import { Moment } from "./moment";
import { MomentColorer } from "./colorers/moment_buffering_colorer";
import { Vec2 } from "../../../engine/data_formats/vec/vec2";
import { TextureUtils } from "../../../engine/utils/texture_utils";
import { IMomentInterpEntry } from "./interpolation/i_moment_queue_entries";
import { MIStates } from "./interpolation/interpolator";
import { InterpolatingFunctions } from "./interpolation/interpolating_functions";
import { InterpolatorManager } from "./interpolator_manager";

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

    private _interpolatorManager = new InterpolatorManager(m => this.onInterpolatorMessage(m), n => this.onInterpolatorError(n), o => this.onInterpolatorStateChange(o));

    private _momentWaitingForColor?: number;
    private _momentsToProcess = 0;

    constructor(currentIndex = 0) {
        this._currentIndex = currentIndex;
        this._currentTexture = TextureUtils.createBufferTexture(500, 250);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        this._interpolatorManager.setup(this._bufferSize);
    }

    clearInterpolationCache() {
        // Do nothing if there's nothing to clear
        if (this._bufferBounds.x == -1 && this._bufferBounds.y == -1) return;
        
        for (let i = this._bufferBounds.x; i <= this._bufferBounds.y; i++) {
            this.clearBuffersAt(i, 'after');
        }

        this._bufferBounds.x = -1;
        this._bufferBounds.y = -1;
        visualizer.events.dispatchEvent('moment-interpolation-cache-cleared');
    }

    replaceInterpolator(fun: InterpolatingFunctions, params: any[]) {
        this._interpolatorManager.replaceInterpolatorOptions(fun, params, this._bufferSize);
        this.setMomentByIndex(this.currentIndex);
    }

    replaceMoments(moments: Moment[]) {
        // kill and replace the interpolator if it's running
        if (this._interpolatorManager.state != 'idle') {
            this._interpolatorManager.killAll();
            this._interpolatorManager.setup(this._bufferSize);
        }
        this.clearInterpolationCache();
        this._moments = moments;
        this.setMomentByIndex(this._currentIndex);
        if (this._currentIndex >= moments.length) {
            this._currentIndex = moments.length - 1;
        }
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
        this._moments[index].clearInterpAndColorData();
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
        visualizer.universeScene.alignSunWithTime(this._moments[index].date);
        visualizer.universeScene.updateSatellites(this._moments[index].satellitesCoords);
    }

    setMomentByIndex(index: number) {

        let hasBeenTexturedYet = false;
        let initialized = this._bufferBounds.x != -1 && this._bufferBounds.y != -1;

        if (this._bufferBounds.containsAsMinMax(index) && initialized) {
            this.subTexAt(index);
            hasBeenTexturedYet = true;

            if (index == this._currentIndex) return;
        }

        // If it's completly out of bounds and the interpolator is still running
        // (this will happen if the user clicks on the timeline while the interpolator is still running
        // in a completly different area).
        if (!this._bufferBounds.containsAsMinMax(index) && initialized) {
            // If the interpolator is still running we're gonna kill it
            if (this._interpolatorManager.state != 'idle') {
                this._interpolatorManager.killAll();
                this._interpolatorManager.setup(this._bufferSize);
            }
            // If the colorer is still running (most probable) we're gonna clear it's queue
            if (this._interpColorProvider.status == 'working') {
                this._interpColorProvider.clearQueue();
            }
            // Now we can clear all the moments cache
            this.clearInterpolationCache();
            initialized = false;
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
        this._interpolatorManager.distributeInterpolationJob(dataToInterpolate);

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

    get currentIndex() {
        return this._currentIndex;
    }

    get interpolator() {
        return this._interpolatorManager;
    }

    get bufferSize() {
        return this._bufferSize;
    }

}