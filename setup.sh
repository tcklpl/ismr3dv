#!/bin/bash

if ! command -v node > /dev/null
then
    echo "[!] NodeJS was not found, please install it or correct your path."
    exit
fi

if ! command -v tsc > /dev/null
then
    echo "[!] No Typescript compiler was found, please install it using:"
    echo "    sudo npm i -g typescript"
    exit
fi

if ! command -v rsync > /dev/null
then
    echo "[!] rsync was not found, please install it or correct your path."
    exit
fi

if ! command -v sed > /dev/null
then
    echo "[!] sed was not found, please install it or correct your path."
    exit
fi

SERVER_PORT=3333

echo -n "[?] What port should the server run in? (default is 3333): "
read desired_server_port
if ! [[ -z "$desired_server_port" ]]; then
    SERVER_PORT=$desired_server_port
fi

if [ $SERVER_PORT -gt 65535 ] || [ $SERVER_PORT -lt 1 ]; then
    echo "[!] Please input a valid port number (1 - 65535)"
    exit
fi

sed "s/<PORT>/$SERVER_PORT/g" .env.model > .env

echo "[-] Setting up server..."
cd server
npm install
tsc
cd ..

echo "[-] Setting up visualizer..."
cd visualizer
npm install
npm run compile
cd ..

echo "[!] The project is ready, you can run it using:"
echo "    node server/out/index.js"
