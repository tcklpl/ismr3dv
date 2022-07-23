import { EngineError } from "./engine/errors/engine_error";
import { Visualizer } from "./visualizer/visualizer";

const canvas = $('#ismr3dcanvas');
const glCtx = (canvas.get(0) as HTMLCanvasElement).getContext('webgl2');
if (!glCtx) throw new EngineError('Engine', `Failed to acquire WebGL2 context`);
globalThis.gl = glCtx;

new Visualizer();

/*
    Make sure we have both EXT_color_buffer_float and OES_texture_float_linear extensions in order to have HDR rendering.
*/
if (!gl.getExtension("EXT_color_buffer_float")) 
    throw new EngineError('Engine', 'Extension EXT_color_buffer_float is not supported by your system');
if (!gl.getExtension("OES_texture_float_linear")) 
    throw new EngineError('Engine', 'Extension OES_texture_float_linear is not supported by your system');

canvas.on('mousedown', e => {
    if (!visualizer.universeScene.isHoveringOverStation)
        document.getElementById('ismr3dcanvas')?.requestPointerLock();
});

canvas.on('mouseup', e => {
    document.exitPointerLock();
});

$(window).on("resize", () => {
    visualizer?.engine?.adjustToWindowSize();
});

window.onerror = (e, source, lineno, colno, error) => {
    if (error && error instanceof EngineError) {
        visualizer.ui.fatal.showScreen(error, source || 'Not identified');
        visualizer.engine.haltExecution();
    }
}

document.addEventListener('pointerlockchange', e => {
    visualizer.pointerLocked = document.pointerLockElement === document.getElementById('ismr3dcanvas');
}, false);