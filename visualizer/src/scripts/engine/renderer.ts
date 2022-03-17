import { Visualizer } from "../visualizer/visualizer";
import { Mat4 } from "./data_formats/mat/mat4";
import { MUtils } from "./utils/math_utils";

export class Renderer {

    private _gl = Visualizer.instance.gl;

    private _cameraManager = Visualizer.instance.cameraManager;
    private _sceneManager = Visualizer.instance.sceneManager;

    private _perspectiveProjectionMatrix!: Mat4;

    private _near = 1;
    private _far = 100;
    private _width = 1920;
    private _height = 1080;
    private _fovY = 45;

    constructor() {
        this.setupGl();
        this.constructPerspectiveProjectionMatrix();
    }

    private setupGl() {
        this._gl.clearColor(0, 0, 0, 1);

        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.enable(this._gl.CULL_FACE);
        this._gl.depthFunc(this._gl.LESS);

        this.resize(this._gl.canvas.clientWidth, this._gl.canvas.clientHeight);
    }

    private constructPerspectiveProjectionMatrix() {
        this._perspectiveProjectionMatrix = Mat4.perspective(MUtils.degToRad(this._fovY), this._width / this._height, this._near, this._far);
    }

    resize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this.constructPerspectiveProjectionMatrix();
        this._gl.viewport(0, 0, width, height);
    } 

    renderActive() {
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        if (!this._sceneManager.active) {
            console.warn(`Trying to render with no active scene`);
            return;
        }
        this._sceneManager.active.objects.forEach(o => {
            o.render(() => {
                this._cameraManager.activeCamera?.matrix.bindUniform(this._gl, o.u_view);
                this._perspectiveProjectionMatrix.bindUniform(this._gl, o.u_projection);
            });
        });
    }

}