import { Mat4 } from "../data_formats/mat/mat4";
import { RenderableObject } from "../data_formats/renderable_object";
import { Shader } from "../shaders/shader";
import { BufferUtils } from "../utils/buffer_utils";
import { MUtils } from "../utils/math_utils";
import { TextureUtils } from "../utils/texture_utils";
import { IRenderProvider } from "./i_render_provider";
import { IRenderSettings } from "./i_render_settings";

export class RenderPickProvider implements IRenderProvider {

    private _cameraManager = visualizer.cameraManager;
    private _shaderManager = visualizer.shaderManager;

    private _pickingShader!: Shader;
    private _pickingShaderIdUniform!: WebGLUniformLocation;
    private _pickingTexture!: WebGLTexture;
    private _pickingRenderbuffer!: WebGLRenderbuffer;
    private _pickingFramebuffer!: WebGLFramebuffer;
    private _pickingProjectionMat4!: Mat4;

    setup(settings: IRenderSettings): void {
        this._pickingRenderbuffer = BufferUtils.createRenderbuffer();
        this._pickingTexture = TextureUtils.createBufferTexture(1, 1);

        gl.bindRenderbuffer(gl.RENDERBUFFER, this._pickingRenderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1, 1);

        this._pickingFramebuffer = BufferUtils.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._pickingFramebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._pickingTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._pickingRenderbuffer);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this._pickingShader = this._shaderManager.assertGetShader('picking');
        this._pickingShaderIdUniform = this._pickingShader.assertGetUniform('u_id');

        this.updatePickingProjectionMatrix(0, 0, settings.fovY, settings.near, settings.far);
    }
    
    updateForResolution(width: number, height: number): void {      
    }

    updatePickingProjectionMatrix(mouseX: number, mouseY: number, fovY: number, near: number, far: number) {
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const top = Math.tan(MUtils.degToRad(fovY) * 0.5) * near;
        const bottom = -top;
        const left = aspect * bottom;
        const right = aspect * top;
        const width = Math.abs(right - left);
        const height = Math.abs(top - bottom);

        const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
        const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;

        const subLeft = left + pixelX * width / gl.canvas.width;
        const subBottom = bottom + pixelY * height / gl.canvas.height;
        const subWidth = width / gl.canvas.width;
        const subHeight = height / gl.canvas.height;

        this._pickingProjectionMat4 = Mat4.frustum(subLeft, subLeft + subWidth, subBottom, subBottom + subHeight, near, far);
    }

    readPickingId() {
        const data = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
        return data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
    }

    render(objects: RenderableObject[]) {
        gl.viewport(0, 0, 1, 1);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._pickingFramebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        objects.forEach(o => {
            o.renderPicking(this._pickingShader, this._pickingShaderIdUniform, () => {
                this._cameraManager.activeCamera?.matrix.bindUniform(gl, o.u_pickingView);
                this._pickingProjectionMat4.bindUniform(gl, o.u_pickingProjection);
            });
        });
    }

    renderAndPickIdUnderMouse(objects: RenderableObject[]) {
        this.render(objects);
        const id = this.readPickingId();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return id;
    }
    
}