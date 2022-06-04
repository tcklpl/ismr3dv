import { Visualizer } from "./visualizer/visualizer";

const canvas = $('#ismr3dcanvas');
const context = (canvas.get(0) as HTMLCanvasElement).getContext('webgl2');
if (!context) throw `Failed to acquire WebGL2 context`;

const visualizer = new Visualizer(context);
canvas.on('click', e => {
    if (!Visualizer.instance.universeScene.isHoveringOverStation)
        document.getElementById('ismr3dcanvas')?.requestPointerLock();
});

$(window).on("resize", () => {
    Visualizer.instance?.engine?.adjustToWindowSize();
});

window.onerror = (e, source) => {
    $('#crash-motive').html(`'${e}' @ ${source}`);
    $('#error-screen').css('display', 'flex');
}

document.addEventListener('pointerlockchange', e => {
    Visualizer.instance.pointerLocked = document.pointerLockElement === document.getElementById('ismr3dcanvas');
}, false);