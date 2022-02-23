import express from 'express';
import compression from 'compression';
import path from 'path';

const server = express();
const port = 3333;

server.use(compression());
server.use(express.static(path.join(__dirname, "..", "..", "visualizer", "out")));

console.log(`Listening on *:${port}`);
server.listen(port);