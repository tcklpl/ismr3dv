import { IRenderLayers } from "./i_render_layers";
import { IRenderProvider } from "./i_render_provider";

export interface IRenderPostProcessingProvider extends IRenderProvider {

    render(layers: IRenderLayers): void;
}