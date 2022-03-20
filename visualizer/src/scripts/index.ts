import { Visualizer } from "./visualizer/visualizer";

try {
    const canvas = $('#ismr3dcanvas');
    const context = (canvas.get(0) as HTMLCanvasElement).getContext('webgl2');
    if (!context) throw `Failed to acquire WebGL2 context`;

    const visualizer = new Visualizer(context);
    canvas.on('click', e => {
        document.getElementById('ismr3dcanvas')?.requestPointerLock();
    });
} catch (e) {
    $('#crash-motive').html(e as string);
    $('#error-screen').css('display', 'flex');
    throw e;
}

$(window).on("resize", () => {
    Visualizer.instance.engine.adjustToWindowSize();
});

document.addEventListener('pointerlockchange', e => {
    Visualizer.instance.pointerLocked = document.pointerLockElement === document.getElementById('ismr3dcanvas');
}, false);