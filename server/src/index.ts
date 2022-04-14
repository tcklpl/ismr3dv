import express from 'express';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';
import routes from './router';
import { Config } from './config';
import { ExampleData } from './example_data';

dotenv.config();

const server = express();
const envport = process.env.PORT;
const envapikey = process.env.UNESP_ISMR_API_KEY;
const envForceShowcase = process.env.FORCE_SHOWCASE_MODE;

if (!envport) {
    console.error("[X] Failed to acquire the server listening port from the enviroment file. Is the .env file at your current directory?");
    process.exit(1);
}
const port = parseInt(envport);
if (isNaN(port) || port < 1 || port > 65535) {
    console.error("[X] Failed to parse the port, is it a number?");
    process.exit(1);
}

new Config(envapikey && (/false/i).test(`${envForceShowcase}`) ? envapikey : "");

console.log(`[-] Server running in ${Config.instance.hasApiKey ? 'normal': 'showcase'} mode`);
console.log("[-] Loading server");

server.use(compression());
server.use(express.static(path.join(__dirname, "..", "..", "visualizer", "out")));
server.use(express.json())
server.use(routes);

console.log("[-] Loading example data");
const exampleData = new ExampleData();


server.listen(port, "0.0.0.0", () => console.log(`[-] Listening on *:${port}`));