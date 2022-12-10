param (
    [switch][Alias("e")]$envOnly = $false,
    [switch][Alias("c")]$clear = $false,
    [switch][Alias("n")]$npmOnly = $false,
    [switch][Alias("p")]$prerequisitesOnly = $false,
    [switch][Alias("h")]$help = $false
)

try { 
    Get-Command node -ErrorAction Stop | Out-Null
} catch [System.Management.Automation.CommandNotFoundException] {
    "[!] NodeJS was not found, please install it or correct your path."
    Exit
}

try { 
    Get-Command python3 -ErrorAction Stop | Out-Null
    Get-Command pip3 -ErrorAction Stop | Out-Null
} catch [System.Management.Automation.CommandNotFoundException] {
    "[!] Python 3 (or pip3) was not found, please install it or correct your path."
    Exit
}

Write-Output "[-] Prerequisites OK"

if ( $prerequisitesOnly ) {
    Exit
}

function Print-Help {
    Write-Output "ISMR3DV Setup utility."
    Write-Output ""
    Write-Output "Syntax: setup.sh [-e|n|c|h]"
    Write-Output "Options:"
    Write-Output "e     -envOnly           Only asks for information to fill the .env file and fills it."
    Write-Output "n     -npmOnly           Skips the .env file configuration."
    Write-Output "p     -prerequisitesOnly Only checks for prerequisites."
    Write-Output "c     -clear             Removes the node_modules and out folders as well as the .env file."
    Write-Output "h     -help              Displays this message."
    Exit
}

function Setup-Env {
    $Port = 3333

    $PortOK = $true
    do {
        $PortOK = $true
        $PortUserInput = Read-Host "[?] What port should the server run in? (default is 3333)"
        if ( $PortUserInput ) {
            if ($PortUserInput -lt 1 -or $PortUserInput -gt 65535) {
                Write-Output "[!] Please input a valid port number (1 - 65535)"
                $PortOK = $false
            } else {
                $Port = $PortUserInput
            }
        }
    } while ( !$PortOK )

    $ApiKey = Read-Host "[?] What is your UNESP ISMR API key? (leave empty for no key)"

    python3 tools/file_string_replacer.py .env.model .env "<PORT>/$Port" "<UNESPKEY>/$ApiKey" 
}

function Setup-NPM {
    Write-Output "[-] Setting up tools..."
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

if ( $help ) {
    Print-Help
}

if ( $clear ) {
    if (Test-Path .env) {
        Remove-Item .env
    }
    if (Test-Path server/node_modules) {
        Remove-Item server/node_modules -Recurse
    }
    if (Test-Path server/out) {
        Remove-Item server/out -Recurse
    }
    if (Test-Path visualizer/node_modules) {
        Remove-Item visualizer/node_modules -Recurse
    }
    if (Test-Path visualizer/out) {
        Remove-Item visualizer/out -Recurse
    }
}

if ( $envOnly -and $npmOnly ) {
    Write-Output "[!] Both ENV-only and NPM-only flags are set, it will be understood that you meant to setup everything."
    Write-Output "[!] To setup everything you don't need to pass any flags, just run the script as ./setup.sh"
    $envOnly = $false
    $npmOnly = $false
}

if ( !$npmOnly ) {
    Setup-Env
}

if ( !$envOnly ) {
    Setup-NPM
}
