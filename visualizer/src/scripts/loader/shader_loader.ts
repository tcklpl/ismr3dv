import { Shader } from "../engine/shaders/shader";
import { AsyncUtils } from "../engine/utils/async_utils";
import { Visualizer } from "../visualizer/visualizer";
import { GenericLoader } from "./generic_loader";
import { IShaderLoadlist } from "./shader_loadlist";

interface IShaderSource {
    name: string;
    vertexSource?: string;
    fragmentSource?: string;
}

export class ShaderLoader extends GenericLoader {

    private _loadlist!: IShaderLoadlist;
    private _shaderManager = Visualizer.instance.shaderManager;
    private _sources: IShaderSource[] = [];

    protected initialize(): void {
        this._loadlist = this._source as IShaderLoadlist;
    }

    load(): void {
        
        this._loadlist.shaders.forEach(shader => {
            const shaderSrc = <IShaderSource>{
                name: shader.name
            };
            this._sources.push(shaderSrc);
            AsyncUtils.getUrlAs(`shaders/${shader.vertex}`, (vert: string) => {
                shaderSrc.vertexSource = vert;
                this.onShaderPartLoad();
            });
            AsyncUtils.getUrlAs(`shaders/${shader.fragment}`, (frag: string) => {
                shaderSrc.fragmentSource = frag;
                this.onShaderPartLoad();
            });
        });

    }

    onShaderPartLoad() {
        if (!this._sources.find(x => !x.fragmentSource || !x.vertexSource)) {
            this.onLoad();
        }
    }

    construct(): void {
        this._sources.forEach(s => {
            this._shaderManager.register(new Shader(s.name, s.vertexSource as string, s.fragmentSource as string));
        });
        this.onConstruct();
    }
    
}