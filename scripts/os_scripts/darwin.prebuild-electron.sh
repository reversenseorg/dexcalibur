#!/bin/sh

echo "[+] Setup Electron Frida-binding"

if [ $# -lt 1 ]; then
  echo "[+] Copying default file ' ./scripts/frida/electron_frida_binding.node ' "
  cp ./scripts/frida/electron_frida_binding.node ./node_modules/frida/build/Release/frida_binding.node
  echo "[+] Copying default file ' ./scripts/frida/electron_better_sqlite3.node ' "
  cp ./scripts/better-sqlite3/electron_better_sqlite3.node ./node_modules/better-sqlite3/build/Release/better_sqlite3.node
else
  echo "[+] Copying ' ./scripts/frida/electron_frida_binding."$1".node ' "
  if [ -f "./scripts/frida/electron_frida_binding."$1".node" ]; then
    cp "./scripts/frida/electron_frida_binding."$1".node" ./node_modules/frida/build/Release/frida_binding.node
  else
    echo "\x1b[31m[!] Error : File ' ./scripts/frida/electron_frida_binding."$1".node ' not found \x1b[0m"
  fi


  echo "[+] Copying ' ./scripts/frida/electron_better_sqlite3_"$1".node ' "
  if [ -f "./scripts/frida/electron_better_sqlite3_"$1".node" ]; then
    cp "./scripts/frida/electron_better_sqlite3_"$1".node" ./node_modules/better-sqlite3/build/Release/better_sqlite3.node
  else
    echo "\x1b[31m[!] Error : File ' ./scripts/better-sqlite3/electron_better_sqlite3_"$1".node ' not found \x1b[0m"
  fi


fi

