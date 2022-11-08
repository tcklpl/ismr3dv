import { MomentColorProgram } from "./moment_color_program";

export class MomentColorG2R extends MomentColorProgram {

    constructor() {
        super('ipp_color_g2r', 'Green to Red', 'Smoothstep from green to red', 'gradient-g2r');
    }
}