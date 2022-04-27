import { IRenderSettings } from "./i_render_settings";

export interface IRenderProvider {

    setup(settings: IRenderSettings): void;
    updateForResolution(width: number, height: number): void;
    
}