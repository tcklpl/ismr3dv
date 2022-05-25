import { Line } from "../mesh/line";
import { Vec3 } from "../vec/vec3";
import { Visualizer } from "../../../visualizer/visualizer";
import { UBoolean } from "../uniformable_basics/u_boolean";
import { MatrixCompliant3DTransformative } from "../matrix_compliant_3d_transformative";

export class Gizmo extends MatrixCompliant3DTransformative {
    
    private _name: string;
    private _enabled = false;
    private _color = new Vec3(1, 1, 1);
    private _bloom = new UBoolean(false);
    private _line: Line;

    private _uColor: WebGLUniformLocation;
    private _uBloom: WebGLUniformLocation;
    private _gl = Visualizer.instance.gl;

    constructor(name: string, line: Line) {
        super(Visualizer.instance.shaderManager.assertGetShader('solid_color'));
        this._name = name;
        this._line = line;

        this.shader.bind();
        this._uColor = this.shader.assertGetUniform('u_color');
        this._uBloom = this.shader.assertGetUniform('u_apply_bloom');
    }
    
    draw(uniformConfiguration: () => void) {
        this.shader.bind();
        this._color.bindUniform(this._gl, this._uColor);
        this._bloom.bindUniform(this._gl, this._uBloom);
        this.modelMatrix.bindUniform(this._gl, this.u_model);
        uniformConfiguration();
        this._line.draw();
    }

    get name() {
        return this._name;
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(v: boolean) {
        this._enabled = v;
    }

    get color() {
        return this._color;
    }

    set color(c: Vec3) {
        this._color = c;
    }

    get bloom() {
        return this._bloom.value;
    }

    set bloom(b: boolean) {
        this._bloom.value = b;
    }

}