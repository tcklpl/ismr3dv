import { Visualizer } from "../../visualizer/visualizer";
import { Mat4 } from "../data_formats/mat/mat4";
import { RenderableObject } from "../data_formats/renderable_object";
import { Shader } from "../shaders/shader";
import { BufferUtils } from "../utils/buffer_utils";
import { MUtils } from "../utils/math_utils";
import { TextureUtils } from "../utils/texture_utils";
import { IRenderProvider } from "./i_render_provider";
import { IRenderSettings } from "./i_render_settings";

export class RenderPickProvider implements IRenderProvider {

    private _gl = Visualizer.instance.gl;
    private _cameraManager = Visualizer.instance.cameraManager;
    private _shaderManager = Visualizer.instance.shaderManager;

    private _pickingShader!: Shader;
    private _pickingShaderIdUniform!: WebGLUniformLocation;
    private _pickingTexture!: WebGLTexture;
    private _pickingRenderbuffer!: WebGLRenderbuffer;
    private _pickingFramebuffer!: WebGLFramebuffer;
    private _pickingProjectionMat4!: Mat4;

    setup(settings: IRenderSettings): void {
        this._pickingRenderbuffer = BufferUtils.createRenderbuffer(this._gl);
        this._pickingTexture = TextureUtils.createBufferTexture(this._gl, 1, 1);

        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, this._pickingRenderbuffer);
        this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_COMPONENT16, 1, 1);

        this._pickingFramebuffer = BufferUtils.createFramebuffer(this._gl);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._pickingFramebuffer);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._pickingTexture, 0);
        this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, this._pickingRenderbuffer);

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);

        this._pickingShader = this._shaderManager.assertGetShader('picking');
        this._pickingShaderIdUniform = this._pickingShader.assertGetUniform('u_id');

        this.updatePickingProjectionMatrix(0, 0, settings.fovY, settings.near, settings.far);
    }
    
    updateForResolution(width: number, height: number): void {      
    }

    updatePickingProjectionMatrix(mouseX: number, mouseY: number, fovY: number, near: number, far: number) {
        const aspect = this._gl.canvas.clientWidth / this._gl.canvas.clientHeight;
        const top = Math.tan(MUtils.degToRad(fovY) * 0.5) * near;
        const bottom = -top;
        const left = aspect * bottom;
        const right = aspect * top;
        const width = Math.abs(right - left);
        const height = Math.abs(top - bottom);

        const pixelX = mouseX * this._gl.canvas.width / this._gl.canvas.clientWidth;
        const pixelY = this._gl.canvas.height - mouseY * this._gl.canvas.height / this._gl.canvas.clientHeight - 1;

        const subLeft = left + pixelX * width / this._gl.canvas.width;
        const subBottom = bottom + pixelY * height / this._gl.canvas.height;
        const subWidth = width / this._gl.canvas.width;
        const subHeight = height / this._gl.canvas.height;

        this._pickingProjectionMat4 = Mat4.frustum(subLeft, subLeft + subWidth, subBottom, subBottom + subHeight, near, far);
    }

    readPickingId() {
        const data = new Uint8Array(4);
        this._gl.readPixels(0, 0, 1, 1, this._gl.RGBA, this._gl.UNSIGNED_BYTE, data);
        return data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
    }

    render(objects: RenderableObject[]) {
        this._gl.viewport(0, 0, 1, 1);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._pickingFramebuffer);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        objects.forEach(o => {
            o.renderPicking(this._pickingShader, this._pickingShaderIdUniform, () => {
                this._cameraManager.activeCamera?.matrix.bindUniform(this._gl, o.u_pickingView);
                this._pickingProjectionMat4.bindUniform(this._gl, o.u_pickingProjection);
            });
        });
    }

    renderAndPickIdUnderMouse(objects: RenderableObject[]) {
        this.render(objects);
        const id = this.readPickingId();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        return id;
    }
    
}