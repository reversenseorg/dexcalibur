#!/bin/sh

echo "[+] Replace Electron Frida-binding"
cp ./scripts/frida/electron_frida_binding.node ./node_modules/frida/build/Release/frida_binding.node
