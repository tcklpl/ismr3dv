import { AsyncUtils } from "../engine/utils/async_utils";
import { GenericLoader } from "./generic_loader";
import { IHTMLLoadlist } from "./html_loadlist";

interface IHTMLElementInfo {
    html: string;
    append_to: string;
    order: number;
}

export class HTMLLoader extends GenericLoader {

    private _loadlist!: IHTMLLoadlist;
    private _parts: IHTMLElementInfo[] = [];

    protected initialize(): void {
        this._loadlist = this._source as IHTMLLoadlist;
    }

    load(): void {
        
        this._loadlist.html_parts.forEach((p, i) => {

            AsyncUtils.getUrlAs(`html_parts/${p.url}`, (res: string) => {
                this._parts.push({
                    html: res,
                    append_to: p.append_to,
                    order: i
                });
                this.onPartLoaded();
            });

        });

    }

    private onPartLoaded() {
        if (this._parts.length == this._loadlist.html_parts.length) this.onLoad();
    }

    construct(): void {

        this._parts.sort((a, b) => {
            return a.order > b.order ? 1 : -1;
        });
        
        this._parts.forEach(p => {
            $(p.append_to).append($.parseHTML(p.html));
        });

        this.onConstruct();

    }
    
}