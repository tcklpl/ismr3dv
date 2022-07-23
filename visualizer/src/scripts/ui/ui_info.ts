import { IUI } from "./i_ui";

export class UIInfo implements IUI {
    
    registerEvents() {
    }

    setFPS(fps: number) {
        $('#info-hud-fps-value').html(`${fps.toFixed(0)} FPS`);
    }

    setFPSVisisble(value: boolean) {
        value ? $('#info-hud-fps').show() : $('#info-hud-fps').hide();
    }

    update() {
        this.setFPSVisisble(visualizer.configurationManager.general.show_fps);
    }

}