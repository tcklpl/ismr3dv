import { MomentColorG2R } from "./green_to_red";
import { MomentColorProgram } from "./moment_color_program";
import { MomentColorRainbow } from "./rainbow";

export class ColorPrograms {

    static RAINBOW: MomentColorRainbow;
    static GREEN_TO_RED: MomentColorG2R;

    static all: MomentColorProgram[];

    static DEFAULT: MomentColorProgram;

    static getByName(name: string) {
        return this.all.find(x => x.name == name);
    }

    static build() {
        this.RAINBOW = new MomentColorRainbow();
        this.GREEN_TO_RED = new MomentColorG2R();

        this.all = [ this.RAINBOW, this.GREEN_TO_RED ];

        this.DEFAULT = this.RAINBOW;
    }
}