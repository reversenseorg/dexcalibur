#!/bin/sh

echo "[+] Setup Electron native binding"

if [ $# -lt 1 ]; then
  echo "[+] Copying default file ' ./scripts/frida/electron_frida_binding.node ' "
  cp ./scripts/frida/electron_frida_binding.node ./node_modules/frida/build/Release/frida_binding.node
  # echo "[+] Copying default file ' ./scripts/better-sqlite3/electron_better_sqlite3.node ' "
  # cp ./scripts/better-sqlite3/electron_better_sqlite3.node ./node_modules/better-sqlite3/build/Release/better_sqlite3.node
else
  echo "[+] Copying ' ./scripts/frida/electron_frida_binding."$1".node ' "
  if [ -f "./scripts/frida/electron_frida_binding."$1".node" ]; then
    cp "./scripts/frida/electron_frida_binding."$1".node" ./node_modules/frida/build/Release/frida_binding.node
  else
    echo "\x1b[31m[!] Error : File ' ./scripts/frida/electron_frida_binding."$1".node ' not found \x1b[0m"
  fi


  echo "[+] Copying ' ./scripts/better-sqlite3/electron_better_sqlite3_"$1".node ' "
  if [ -f "./scripts/better-sqlite3/electron_better_sqlite3_v89.node" ]; then
    echo 'SKIPPED'
  #  cp "./scripts/better-sqlite3/electron_better_sqlite3_v89.node" ./node_modules/better-sqlite3/build/Release/better_sqlite3.node
  else
    echo 'SKIPPED'
  #  echo "\x1b[31m[!] Error : File ' ./scripts/better-sqlite3/electron_better_sqlite3_v89.node ' not found \x1b[0m"
  fi


fi

# if apple silicon, rebuild sqlite3

if [[ `uname -m` == 'arm64' ]]; then
  echo "[+] Rebuilding better-sqlite3 for electron/arm64 "
  cp $HOME/Projects/electon_tools/node_modules/better-sqlite3/build/Release/better_sqlite3.node ./node_modules/better-sqlite3/build/Release/better_sqlite3.node
  # ROOT_DIR=$PWD;
  # cd ./node_modules/better-sqlite3/
  # node-gyp configure
  # node-gyp build
  # cd $ROOT_DIR
  # ../dexcalibur-ui/dxc-web/node_modules/.bin/electron-rebuild -f -o better-sqlite3
fi

