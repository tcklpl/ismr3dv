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
