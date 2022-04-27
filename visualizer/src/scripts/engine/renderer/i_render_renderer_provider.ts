import { RenderableObject } from "../data_formats/renderable_object";
import { IRenderProvider } from "./i_render_provider";

export interface IRenderRendererProvider extends IRenderProvider {

    render(objects: RenderableObject[]): void;
}