import { ILoader } from "./i_loader";

export abstract class GenericLoader implements ILoader {
    
    onLoad: () => void;
    protected _source: any;

    constructor(source: any, onLoad: () => void) {
        this._source = source;
        this.onLoad = onLoad;
        if (this.initialize)
            this.initialize();
    }

    protected initialize(): void {};
    abstract load(): void;
    
}