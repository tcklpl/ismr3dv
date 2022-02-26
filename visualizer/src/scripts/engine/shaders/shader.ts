import { Visualizer } from "../../visualizer/visualizer";
import { ShaderUtils } from "../utils/shader_utils";

export class Shader {

    private _name: string;

    protected _program: WebGLProgram;
    protected _attributes: Map<string, number> = new Map();
    protected _uniforms: Map<string, WebGLUniformLocation> = new Map();
    protected _gl = Visualizer.instance.gl;

    constructor(name: string, vertexSource: string, fragmentSource: string) {
        this._name = name;

        this._program = ShaderUtils.createProgram(this._gl, vertexSource, fragmentSource);
        this._gl.useProgram(this._program);

        // create list of unique words in the shader source code
        let words: string[] = [];
        words.concat(vertexSource.split('\n').join(' ').split(' '));
        words.concat(fragmentSource.split('\n').join(' ').split(' '));
        words = words.filter((item, i, arr) => arr.indexOf(item) === i);

        // get all the attributes
        words.filter(x => x.startsWith('a_')).forEach(attr => {
            this._attributes.set(attr, this._gl.getAttribLocation(this._program, attr));
        });

        // get all the uniforms
        words.filter(x => x.startsWith('u_')).forEach(uniform => {
            let u = this._gl.getUniformLocation(this._program, uniform);
            if (!u) throw `Faield to get uniform ${uniform} at shader ${name}`;
            this._uniforms.set(uniform, u);
        });
    }

    bind() {
        this._gl.useProgram(this._program);
    }

    public get name() {
        return this._name;
    }

}