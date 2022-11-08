import { MomentColorProgram } from "./moment_color_program";

export class MomentColorRainbow extends MomentColorProgram {

    constructor() {
        super('ipp_color_rainbow', 'Rainbow', 'HUE from purpleish blue to red', 'gradient-rainbow');
    }
}