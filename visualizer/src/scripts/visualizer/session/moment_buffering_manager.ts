import { Shader } from "../../engine/shaders/shader";
import { Visualizer } from "../visualizer";
import { Moment } from "./moment";
import { TimelineImageBuffers } from "./timeline_image_buffers";

interface IIPPShaderChannel {
    buffer: WebGLUniformLocation;
    length: WebGLUniformLocation;
}

interface IIPPShaderUniformCollection {
    r: IIPPShaderChannel;
    g: IIPPShaderChannel;
    b: IIPPShaderChannel;
    a: IIPPShaderChannel;
    threshold: WebGLUniformLocation;
    available_buffers: WebGLUniformLocation;
    fragment_importance_method: WebGLUniformLocation;
}

export class MomentBufferingManager {

    // moments will be arranged as
    // [ [1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], ... ]
    private _moments: Moment[][] = [];
    private _texBuffers: TimelineImageBuffers;

    private _ippThreshold: number;
    private _gl = Visualizer.instance.gl;

    private _currentIndex: number;
    private _shader: Shader;
    private _uniforms: IIPPShaderUniformCollection;

    constructor(texBuffers: TimelineImageBuffers, ippThreshold: number, currentIndex = 0) {
        this._texBuffers = texBuffers;
        this._currentIndex = currentIndex;
        this._ippThreshold = ippThreshold;

        this._shader = Visualizer.instance.shaderManager.assertGetShader('ipp_batch_renderer');
        this._shader.bind();
        this._uniforms = {
            r: {
                buffer: this._shader.assertGetUniform('u_buffer_r'),
                length: this._shader.assertGetUniform('u_buffer_r_length')
            },
            g: {
                buffer: this._shader.assertGetUniform('u_buffer_g'),
                length: this._shader.assertGetUniform('u_buffer_g_length')
            },
            b: {
                buffer: this._shader.assertGetUniform('u_buffer_b'),
                length: this._shader.assertGetUniform('u_buffer_b_length')
            },
            a: {
                buffer: this._shader.assertGetUniform('u_buffer_a'),
                length: this._shader.assertGetUniform('u_buffer_a_length')
            },
            threshold: this._shader.assertGetUniform('u_distance_threshold'),
            available_buffers: this._shader.assertGetUniform('u_available_buffers'),
            fragment_importance_method: this._shader.assertGetUniform('u_fragment_importance_method')
        };
    }

    replaceMoments(newMoments: Moment[], newIndex = 0) {
        this._moments.forEach(i => i.forEach(m => m.freeBuffer()));
        this._moments = [];
        while (newMoments.length > 0) {
            this._moments.push(newMoments.splice(0, 4));
        }
        this._currentIndex = newIndex;
        this.rebuffer();
    }

    rebuffer() {
        const avaialbleSize = this._texBuffers.bufferCount;
        const availableToEachDirection = (avaialbleSize - 1) / 2;
        
        const buffersToLeft = Math.min(Math.floor(this._currentIndex / 4), availableToEachDirection);
        const buffersToRight = Math.min(this._moments.length - Math.floor(this._currentIndex / 4) - 1, availableToEachDirection);
        
        for (let b = -buffersToLeft; b <= buffersToRight; b++) {
            const bufferStart = Math.floor(this._currentIndex / 4) + b;
            const moments = this._moments[bufferStart];
            this.cacheMomentsAtTextureOffset(b, moments);
        }
    }

    private cacheMomentsAtTextureOffset(offset: number, moments: Moment[]) {
        if (moments.length > 4) throw `Failed to cache a list with more than 4 moments`;
        const buf = this._texBuffers.getOffsettedBuffer(offset);

        this._shader.bind();
        this._gl.uniform1i(this._uniforms.fragment_importance_method, 2);
        this._gl.uniform1f(this._uniforms.threshold, this._ippThreshold);

        const indexToUniforms = (index: number) => {
            switch (index) {
                case 0: return this._uniforms.r;
                case 1: return this._uniforms.g;
                case 2: return this._uniforms.b;
                case 3: return this._uniforms.a;
                default: throw `Invalid index`;
            }
        }

        for (let i = 0; i < moments.length; i++) {
            const uniforms = indexToUniforms(i);

            this._gl.uniform1i(uniforms.buffer, i);
            this._gl.activeTexture(this._gl.TEXTURE0 + i);
            this._gl.bindTexture(this._gl.TEXTURE_2D, moments[i].buffer);

            this._gl.uniform1i(uniforms.length, moments[i].data.length);
        }

        this._gl.uniform1i(this._uniforms.available_buffers, moments.length);

        this._gl.viewport(0, 0, this._texBuffers.resolution.x, this._texBuffers.resolution.y);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, buf.fb);
        Visualizer.instance.engine.renderer.renderQuad();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    nextMoment() {
        // do nothing if it's the last moment
        if (this._currentIndex >= (this._moments.length - 1) * 4 + this._moments[this._moments.length - 1].length) return this._texBuffers.activeBuffer;

        this._currentIndex++;
        const curMomentsIndex = Math.floor(this._currentIndex / 4);

        // check if it's still on the same image, if yes, return the current image
        if (curMomentsIndex == Math.floor((this._currentIndex - 1) / 4)) {
            return this._texBuffers.activeBuffer.tex;
        }

        /*  it'll need to be the next image, so we'll need to cache i+2 as it is currently
                             \/ current
            [ i-2 ] [ i-1 ] [i] [ i+1 ] [ i+2 ]
                                  /\ next
            
                            \/ current
            [ i-1 ] [ i ] [ i+1 ] [ i+2 ] [ i-2 ] < next i+2
        */

        // first, can we cache i+2?
        if (this._moments.length - curMomentsIndex >= 3) {
            const moments = this._moments[curMomentsIndex + 2];
            this.cacheMomentsAtTextureOffset(2, moments);
        }

        // now return the next texture
        return this._texBuffers.moveNext().tex;
    }

    previousMoment() {
        // do nothing if it's the first moment
        if (this._currentIndex <= 0) return this._texBuffers.activeBuffer;

        this._currentIndex--;
        const curMomentsIndex = Math.floor(this._currentIndex / 4);

        // check if it's still on the same image, if yes, return the current image
        if (curMomentsIndex == Math.floor((this._currentIndex + 1) / 4)) {
            return this._texBuffers.activeBuffer.tex;
        }

        /*  it'll need to be the previous image, so we'll need to cache i+2 as it is currently
                             \/ current
            [ i-2 ] [ i-1 ] [i] [ i+1 ] [ i+2 ]
                      /\ next
            
                            \/ current
            [ i+1 ] [ i ] [ i-1 ] [ i-2 ] [ i+2 ]
              /\ next i-2
        */

        // first, can we cache i-2?
        if (curMomentsIndex >= 2) {
            const moments = this._moments[curMomentsIndex - 2];
            this.cacheMomentsAtTextureOffset(-2, moments);
        }

        // now return the next texture
        return this._texBuffers.movePrevious().tex;
    }

    setMomentByIndex(i: number) {
        // if it's off the current buffer
        if (i < this.currentIndexBy4 * 4 - 8 || i > this.currentIndexBy4 * 4 + 12) {
            this._currentIndex = i;
            this.rebuffer();
            return this._texBuffers.activeBuffer.tex;
        }

        // if it's in the same buffer
        const floorI = Math.floor(i / 4);
        if (floorI == this.currentIndexBy4) {
            return this._texBuffers.activeBuffer.tex;
        }

        // if it's forward
        for (let i = this.currentIndexBy4; i < floorI && i < this._moments.length; i++) {
            if (i < this._moments.length - 3) {
                const moments = this._moments[this.currentIndexBy4 + 2];
                this.cacheMomentsAtTextureOffset(2, moments);
            }
            this._texBuffers.moveNext();
        }

        // if it's backwards
        for (let i = this.currentIndexBy4; i > floorI && i > 0; i--) {
            if (i > 2) {
                const moments = this._moments[this.currentIndexBy4 - 2];
                this.cacheMomentsAtTextureOffset(-2, moments);
            }
            this._texBuffers.movePrevious();
        }

        this._currentIndex = i;
        return this._texBuffers.activeBuffer.tex;
    }

    private get currentIndexBy4() {
        return Math.floor(this._currentIndex / 4);
    }

}