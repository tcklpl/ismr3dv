import express from 'express';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const server = express();
const port = process.env.PORT;

if (!port) {
    console.error("Failed to acquire the server listening port from the enviroment file. Is the .env file at your current directory?");
    process.exit(1);
}

server.use(compression());
server.use(express.static(path.join(__dirname, "..", "..", "visualizer", "out")));

server.listen(port, () => console.log(`Listening on *:${port}`));