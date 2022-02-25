import { ILoader } from "./i_loader";

export abstract class GenericLoader implements ILoader {
    
    onLoad: () => void;
    onConstruct: () => void;
    protected _source: any;

    constructor(source: any, onLoad: () => void, onConstruct: () => void) {
        this._source = source;
        this.onLoad = onLoad;
        this.onConstruct = onConstruct;
        if (this.initialize)
            this.initialize();
    }

    protected initialize(): void {};
    abstract load(): void;
    
}