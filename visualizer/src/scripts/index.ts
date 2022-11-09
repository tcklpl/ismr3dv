import { EngineError } from "./engine/errors/engine_error";
import { Visualizer } from "./visualizer/visualizer";

// First acquire the WebGL2 Rendering Context
const canvas = $('#ismr3dcanvas');
const glCtx = (canvas.get(0) as HTMLCanvasElement).getContext('webgl2', {stencil: true});
if (!glCtx) throw new EngineError('Engine', `Failed to acquire WebGL2 context`);
globalThis.gl = glCtx;

// Make sure we have both EXT_color_buffer_float and OES_texture_float_linear extensions in order to have HDR rendering.
if (!gl.getExtension("EXT_color_buffer_float")) 
    throw new EngineError('Engine', 'Extension EXT_color_buffer_float is not supported by your system');
if (!gl.getExtension("OES_texture_float_linear")) 
    throw new EngineError('Engine', 'Extension OES_texture_float_linear is not supported by your system');

// Now get the 2D canvas context
const mc2d = $('#timeline-moment-indicator-canvas');
const mc2dCtx = (mc2d.get(0) as HTMLCanvasElement).getContext('2d');
if (!mc2dCtx) throw new EngineError('Engine', `Failed to acquire 2D context`);
globalThis.moment2DCanvas = mc2dCtx;

// Initialize the visualizer, this will trigger all the loading and initialization
new Visualizer();

canvas.on('mousedown', e => {
    if (!visualizer.universeScene.isHoveringOverStation)
        document.getElementById('ismr3dcanvas')?.requestPointerLock();
});

canvas.on('mouseup', e => {
    document.exitPointerLock();
});

let resizeTimeout: number = -1;
$(window).on("resize", () => {
    if (resizeTimeout != -1) {
        clearTimeout(resizeTimeout);
        resizeTimeout = -1;
    }
    resizeTimeout = setTimeout(() => {
        visualizer?.engine?.adjustToWindowSize();
    }, 200);
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