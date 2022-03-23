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
        const vertexWords = vertexSource.split('\n').join(' ').split(' ');
        const fragmentWords = fragmentSource.split('\n').join(' ').split(' ');
        words.push(...vertexWords);
        words.push(...fragmentWords);
        words = words.filter((item, i, arr) => arr.indexOf(item) == i);

        // get all the attributes
        words.filter(x => x.startsWith('a_')).forEach(attr => {
            let name = attr.replace(/[^a-z0-9_]/gi, "");
            this._attributes.set(name, this._gl.getAttribLocation(this._program, name));
        });

        // get all the uniforms
        words.filter(x => x.startsWith('u_')).forEach(uniform => {
            let name = uniform.replace(/[^a-z0-9_]/gi, "");
            let u = this._gl.getUniformLocation(this._program, name);
            if (!u) throw `Failed to get uniform '${name}' at shader ${this._name}`;
            this._uniforms.set(name, u);
        });
    }

    bind() {
        this._gl.useProgram(this._program);
    }

    getUniform(name: string) {
        return this._uniforms.get(name);
    }

    assertGetUniform(name: string) {
        const res = this.getUniform(name);
        if (!res) throw `Failed to get uniform ${name} from shader ${this._name}\nAvailable (${this._uniforms.size}):\n${[...this._uniforms.keys()]}`;
        return res;
    }

    public get name() {
        return this._name;
    }

}