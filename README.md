# ISMR3DV

This is my undergraduate thesis: **ISMR3DV** (Ionospheric Scintillation Monitoring Results: 3D Visualizer). Built using WebGL2 and typescript.

The project contains 2 folders: `server` and `visualizer`. `visualizer` is the actual project and `server` is just a basic NodeJS + Express server to run the project.

# Compiling and Running

You can compile the server and the visualizer on any order you like. 

To compile the server:
```
    cd server
    tsc
```

To compile the visualizer:
```
    cd visualizer
    npm run compile
```
> The visualizer compile script uses `rsync` to copy the source files to the `out` dir. If you don't have acess to `rsync` you can use something similar or just manually copy the files to the destination. `rsync` copies all files that are not `html` or `ts`, that means: images, css, shaders sources and so on.