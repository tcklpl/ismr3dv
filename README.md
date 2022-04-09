# ISMR3DV

This is my undergraduate thesis: **ISMR3DV** (Ionospheric Scintillation Monitoring Results: 3D Visualizer). Built using WebGL2 and typescript.

The project contains 2 folders: `server` and `visualizer`. `visualizer` is the actual project and `server` is just a basic NodeJS + Express server to run the project.

# Compiling and Running

## Script

There is an automated script to setup the project, you can run it using
```
$ ./setup.sh
```
> If the `setup.sh` script is not runnable, you can make it so with `chmod +x setup.sh`.

## Manually

First you'll need to configure the enviroment for the server, the model can be found at `./.env.model`. You'll need to copy this file to `./.env` and configure what is needed.

You can compile the server and the visualizer on any order you like.
> Before compiling, make sure that all required packages are installed for each project. If you just downloaded it you can install them with `npm install` on each project.

To compile the server:
```
$ cd server
$ npm run compile
```

To compile the visualizer:
```
$ cd visualizer
$ npm run compile
```
> The visualizer compile script uses `rsync` to copy the source files to the `out` dir. If you don't have acess to `rsync` you can use something similar or just manually copy the files to the destination. `rsync` copies all files that are not `html` or `ts`, that means: images, css, shaders sources and so on.

After this you can run the project with
```
$ node server/out/index.js
```
> Please note that the `.env` file has to be in the folder that you are executing the command above. By default the `.env` file is at the root. 

And access it at `localhost:<port you defined>`.

# Credits

Earth and Sun textures by [**Solar System Scope**](https://www.solarsystemscope.com/textures/), distributed under Creative Commons 4.0 International (CC BY 4.0). No additional changes were made to the textures.