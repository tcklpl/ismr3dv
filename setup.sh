#!/bin/bash

if ! command -v node > /dev/null
then
    echo "[!] NodeJS was not found, please install it or correct your path."
    exit
fi

if ! command -v sed > /dev/null
then
    echo "[!] sed was not found, please install it or correct your path."
    exit
fi

if ! command -v scss > /dev/null
then
    echo "[!] scss (sass) was not found, please install it or correct your path."
    exit
fi

if ! command -v python3 > /dev/null
then
    echo "[!] Python 3 was not found, please install it or correct your path."
    exit
fi

if ! command -v pip3 > /dev/null
then
    echo "[!] pip3 (python3-pip) was not found, please install it or correct your path."
    exit
fi

help() {
    echo "ISMR3DV Setup utility."
    echo
    echo "Syntax: setup.sh [-e|n|c|h]"
    echo "Options:"
    echo "e     --env-only      Only asks for information to fill the .env file and fills it."
    echo "n     --npm-only      Skips the .env file configuration."
    echo "p     --prerequisites Only checks for prerequisites."
    echo "c     --clear         Removes the node_modules and out folders as well as the .env file."
    echo "q     --quiet         Sends the NPM output to /dev/null."
    echo "h     --help          Displays this message."
    exit
}

setup_env() {
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

    UNESP_API_KEY=""

    echo -n "[?] What is your UNESP ISMR API key? (leave empty for no key): "
    read user_api_key
    if ! [[ -z "$user_api_key" ]]; then
        UNESP_API_KEY=$user_api_key
    fi

    sed \
        -e "s/<PORT>/$SERVER_PORT/g"\
        -e "s/<UNESPKEY>/$UNESP_API_KEY/g"\
        .env.model > .env
}

setup_npm() {
    echo "[-] Setting up tools..."
    pip3 install -r tools/requirements.txt

    echo "[-] Setting up server..."
    cd server
    npm install
    npm run compile
    cd ..

    echo "[-] Setting up visualizer..."
    cd visualizer
    npm install
    mkdir out
    npm run compile
    cd ..

    echo "[!] The project is ready, you can run it using:"
    echo "    node server/out/index.js"
}

FLAG_PREREQUISITES_ONLY=false
FLAG_ENV_ONLY=false
FLAG_CLEAR=false
FLAG_NPM_ONLY=false
FLAG_QUIET_NPM=false

while getopts ecnqph-: OPT; do
    if [ "$OPT" = "-" ]; then
        OPT="${OPTARG%%=*}"
        OPTARG="${OPTARG#$OPT}"
        OPTARG="${OPTARG#=}"
    fi
    case "$OPT" in
        e | env-only ) FLAG_ENV_ONLY=true ;;
        c | clear ) FLAG_CLEAR=true ;;
        n | npm-only ) FLAG_NPM_ONLY=true ;;
        p | prerequisites ) FLAG_PREREQUISITES_ONLY=true ;;
        q | quiet ) FLAG_QUIET_NPM=true ;;
        h | help ) help ;;
        ??* ) echo "Illegal option --$OPT"; exit ;;
        ? ) exit
    esac
done

echo "[-] Prerequisites OK"

if $FLAG_PREREQUISITES_ONLY; then exit; fi

if $FLAG_CLEAR; then
    rm -rf .env server/node_modules server/out visualizer/node_modules visualizer/out
fi

if $FLAG_ENV_ONLY && $FLAG_NPM_ONLY; then
    echo "[!] Both ENV-only and NPM-only flags are set, it will be understood that you meant to setup everything."
    echo "[!] To setup everything you don't need to pass any flags, just run the script as ./setup.sh"
    FLAG_ENV_ONLY=false
    FLAG_NPM_ONLY=false
fi

if ! $FLAG_NPM_ONLY; then setup_env; fi

if ! $FLAG_ENV_ONLY; then setup_npm; fi

