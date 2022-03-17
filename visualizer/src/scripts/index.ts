import { Visualizer } from "./visualizer/visualizer";

try {
    const canvas = $('#ismr3dcanvas');
    const context = (canvas.get(0) as HTMLCanvasElement).getContext('webgl2');
    if (!context) throw `Failed to acquire WebGL2 context`;

    const visualizer = new Visualizer(context);
} catch (e) {
    $('#crash-motive').html(e as string);
    $('#error-screen').css('display', 'flex');
}

$(window).on("resize", () => {
    Visualizer.instance.engine.adjustToWindowSize();
});