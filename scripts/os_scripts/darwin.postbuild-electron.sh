#!/bin/sh

echo "[+] Setup Electron Frida-binding into 'dist' "

if [ $# -lt 1 ]; then
  echo "[+] Copying default file ' ./scripts/frida/electron_frida_binding.node ' "
  cp ./scripts/frida/electron_frida_binding.node ./dist/node_modules/frida/build/Release/frida_binding.node
else
  echo "[+] Copying ' ./scripts/frida/electron_frida_binding."$1".node ' in 'dist' folder"
  if [ -f "./scripts/frida/electron_frida_binding."$1".node" ]; then
    cp "./scripts/frida/electron_frida_binding."$1".node" ./dist/node_modules/frida/build/Release/frida_binding.node
  else
    echo "\x1b[31m[!] Error : File ' ./scripts/frida/electron_frida_binding."$1".node ' not found \x1b[0m"
  fi
fi

