import { Visualizer } from "../visualizer/visualizer";

export class UIInfo {

    static setFPS(fps: number) {
        $('#info-hud-fps-value').html(`${fps.toFixed(0)} FPS`);
    }

    static setFPSVisisble(value: boolean) {
        value ? $('#info-hud-fps').show() : $('#info-hud-fps').hide();
    }

    static update() {
        this.setFPSVisisble(Visualizer.instance.configurationManager.general.show_fps);
    }

}