import { Visualizer } from "./visualizer/visualizer";

declare global {
    var gl: WebGL2RenderingContext;
    var visualizer: Visualizer;
}