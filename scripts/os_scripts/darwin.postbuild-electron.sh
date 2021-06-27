#!/bin/sh

echo "[+] Setup Electron Frida-binding"
cp ./scripts/frida/electron_frida_binding.node ./dist/node_modules/frida/build/Release/frida_binding.node
