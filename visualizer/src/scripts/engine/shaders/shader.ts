import { EngineError } from "../errors/engine_error";
import { ShaderUtils } from "../utils/shader_utils";

export class Shader {

    private _name: string;

    protected _program: WebGLProgram;
    protected _attributes: Map<string, number> = new Map();
    protected _uniforms: Map<string, WebGLUniformLocation> = new Map();

    constructor(name: string, vertexSource: string, fragmentSource: string) {
        this._name = name;

        this._program = ShaderUtils.createProgram(gl, vertexSource, fragmentSource);
        gl.useProgram(this._program);

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
            this._attributes.set(name, gl.getAttribLocation(this._program, name));
        });

        // get all the uniforms
        const uniqueUniformIdentifiers: string[] = [];
        (vertexSource + '\n' + fragmentSource).split('\n').filter(l => l.startsWith('uniform ')).forEach(uniformDeclarationLine => {
            const uniformIdentifierMatch = /uniform \w+ (u_\w+)(\[\d+\])?;/gi.exec(uniformDeclarationLine);

            // if no match groups
            if (!uniformIdentifierMatch || uniformIdentifierMatch.length <= 1) throw new ShaderError(`Invalid uniform identifier: '${uniformDeclarationLine}'`);

            const baseName = uniformIdentifierMatch[1];
            if (!uniqueUniformIdentifiers.includes(baseName)) {

                uniqueUniformIdentifiers.push(baseName);
                const uniformsToGet: string[] = [];

                // if it's an array (contains the second match group that is '\[\d+\]')
                if (uniformIdentifierMatch[2]) {
                    const arrayLength = parseInt(uniformIdentifierMatch[2].replace(/[^\d]/g, ''));

                    for (let i = 0; i < arrayLength; i++) {
                        uniformsToGet.push(`${baseName}[${i}]`);
                    }
                } else {
                    uniformsToGet.push(baseName);
                }

                uniformsToGet.forEach(uName => {
                    const u = gl.getUniformLocation(this._program, uName);
                    if (!u) throw new ShaderError(`Failed to get uniform '${uName}' at shader ${this._name}`);
                    this._uniforms.set(uName, u);
                });

            }
        });
    }

    bind() {
        gl.useProgram(this._program);
    }

    getUniform(name: string) {
        return this._uniforms.get(name);
    }

    assertGetUniform(name: string) {
        const res = this.getUniform(name);
        if (!res) throw new ShaderError(`Failed to get uniform ${name} from shader ${this._name}\nAvailable (${this._uniforms.size}):\n${[...this._uniforms.keys()]}`);
        return res;
    }

    public get name() {
        return this._name;
    }

}

class ShaderError extends EngineError {
    constructor(description: string) {
        super('Shader', description);
    }
}