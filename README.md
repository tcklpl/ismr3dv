# ISMR3DV

This is my undergraduate thesis: **ISMR3DV** (Ionospheric Scintillation Monitoring Results: 3D Visualizer). Built using WebGL2 and typescript.

The project contains 2 folders: `server` and `visualizer`. `visualizer` is the actual project and `server` is a NodeJS + Express server to statically serve the visualizer and act as a middle man between the visualizer and the API in order to not expose the private API key.

# Compiling and Running

## Dependencies
To build the project you'll need the following dependencies:
* NodeJS (I'm using 16.13.2)
* NPM (I'm using 8.5.0)
* SCSS (SASS Compiler Implementation, I'm using Ruby Sass 3.7.4)
* Python 3 (I'm using 3.8.10)
* PIP3 (python3-pip, I'm using 20.0.2)

## API Key
If you desire to run the project fetching actual data you'll need an API key, this key is associated with your account at the [ISMR Query Tool](https://ismrquerytool.fct.unesp.br/is/) and you can request one [here](https://ismrquerytool.fct.unesp.br/is/ismrtool/registration/index.php).

However, **you can still run the visualizer without this key**. If you don't have a key or just wants to see the visualizer, when prompted to insert a key just leave it empty and press `enter` (If you are not using the setup script just replace `UNESP_ISMR_API_KEY=<UNESPKEY>` with `UNESP_ISMR_API_KEY=` at the `.env`).

If you decide to run the server without a key it will run in `showcase mode`, where all queries will return pre-fetched data stored on the server (at `server/src/example_data`).
> You can force the `showcase mode` by changing the `FORCE_SHOWCASE_MODE` declaration to `true` at the `.env`. It defaults to `false` and is not asked to you when running the setup script because it's mostly used only during development to still have an API key configured and test the showcase mode.

## Script

There is an automated script to setup the project, the script will automatically check the dependencies, install the prerequisites, setup and compile the project. You can run it using
```
$ ./setup.sh
```
> If the `setup.sh` script is not runnable, you can make it so with `chmod +x setup.sh`.

## Manually

First you'll need to configure the enviroment for the server, the model can be found at `./.env.model`. You'll need to copy this file to `./.env` and configure what is needed.
You can compile the server and the visualizer on any order you like.

First make sure that you have the required python dependencies:
```
$ pip3 install -r tools/requirements.txt
```

To compile the server:
```
$ cd server
$ npm install
$ npm run compile
```

To compile the visualizer:
```
$ cd visualizer
$ npm install
$ npm run compile
```

After this you can run the project with
```
$ node server/out/index.js
```
> Please note that the `.env` file has to be in the folder that you are executing the command above. By default the `.env` file is at the project's root directory. 

And access it at `http://localhost:<port you defined>`.

# Credits

Earth and Sun textures by [**Solar System Scope**](https://www.solarsystemscope.com/textures/), distributed under Creative Commons 4.0 International (CC BY 4.0). No additional changes were made to the textures.

Skybox textures were made using [**Spacescape**](https://github.com/petrocket/spacescape) by Alex Peterson, distributed under the MIT License.
