import { Visualizer } from "../../../visualizer/visualizer";
import { Vec2 } from "../../data_formats/vec/vec2";
import { EngineError } from "../../errors/engine_error";
import { BufferUtils } from "../../utils/buffer_utils";
import { TextureUtils } from "../../utils/texture_utils";

interface BloomMip {
    size: Vec2;
    intSize: Vec2;
    texture: WebGLTexture;
}

export class BloomFBO {

    private _gl = Visualizer.instance.gl;
    private _fbo!: WebGLFramebuffer;

    private _mipChain: BloomMip[] = [];

    constructor(width: number, height: number, mipChainLength: number) {
        this.resize(width, height, mipChainLength);
    }
    
    resize(width: number, height: number, mipChainLength: number) {

        if (width < 0 || width > Number.MAX_SAFE_INTEGER || height < 0 || height > Number.MAX_SAFE_INTEGER)
            throw new EngineError('Bloom FBO', `Failed to create a bloom FBO with dimensions ${width}x${height}`);
        
        this.destroy();

        this._fbo = BufferUtils.createFramebuffer(this._gl);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._fbo);

        const size = new Vec2(width, height);
        const intSize = new Vec2(width, height);

        for (let i = 0; i < mipChainLength; i++) {

            size.divide(2);
            intSize.divideAndFloor(2);

            // We cannot make a texture with less than 1 pixel
            if (size.x < 1 || size.y < 1) break;

            const texture = TextureUtils.createWebGLTexture(this._gl);
            // I's possible to use GL_R11F_G11F_B10F because of the extensions EXT_color_buffer_float and OES_texture_float_linear
            // Reference: https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.R11F_G11F_B10F, 
                intSize.x, intSize.y, 0, this._gl.RGB, this._gl.FLOAT, null);
            
            const mip = <BloomMip>{
                size: size.clone(),
                intSize: intSize.clone(),
                texture: texture
            };

            this._mipChain.push(mip);
        }

        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._mipChain[0].texture, 0);

        BufferUtils.assertFrameBufferCompletion(this._gl, 'Bloom FBO not complete');
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    bind() {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._fbo);
    }

    destroy() {
        this._mipChain.forEach(m => this._gl.deleteTexture(m.texture));
        this._gl.deleteFramebuffer(this._fbo);
    }

    get mipChain() {
        return this._mipChain;
    }
}