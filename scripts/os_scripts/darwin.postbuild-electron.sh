#!/bin/sh

echo "[+] Setup Electron Frida-binding into 'dist' "

rm ./dist/node_modules/frida/build/Release/frida_binding.node
# rm ./dist/node_modules/better-sqlite3/build/Release/better_sqlite3.node

if [ $# -lt 1 ]; then
  echo "[+] Copying default file ' ./scripts/frida/electron_frida_binding.node ' "
  cp ./scripts/frida/electron_frida_binding.node ./dist/node_modules/frida/build/Release/frida_binding.node


  echo "[+] Rebuilding better-sqlite3 "
  # cp ./scripts/better-sqlite3/electron_better_sqlite3_v89.node ./node_modules/better-sqlite3/build/Release/better_sqlite3.node
  if [ -f '../dexcalibur-ui/dxc-web/node_modules/.bin/electron-rebuild' ]; then
    echo 'SKIPPED'
  #  ../dexcalibur-ui/dxc-web/node_modules/.bin/electron-rebuild --module-dir ./node_modules/better-sqlite3
  fi

  echo "[+] Copying default file ' ./scripts/better-sqlite3/electron_better_sqlite3.node ' "
  # cp ./node_modules/better-sqlite3/build/Release/better_sqlite3.node ./dist/node_modules/better-sqlite3/build/Release/better_sqlite3.node
else
  echo "[+] Copying ' ./scripts/frida/electron_frida_binding."$1".node ' in 'dist' folder"
  if [ -f "./scripts/frida/electron_frida_binding."$1".node" ]; then
    cp "./scripts/frida/electron_frida_binding."$1".node" ./dist/node_modules/frida/build/Release/frida_binding.node
  else
    echo "\x1b[31m[!] Error : File ' ./scripts/frida/electron_frida_binding."$1".node ' not found \x1b[0m"
  fi

  # echo "[+] Copying ' ./scripts/better-sqlite3/electron_better_sqlite3_"$1".node ' "
  # if [ -f "./scripts/better-sqlite3/electron_better_sqlite3_"$1".node" ]; then
  #   cp "./scripts/better-sqlite3/electron_better_sqlite3_v89.node" ./node_modules/better-sqlite3/build/Release/better_sqlite3.node
  # else
  #   echo "\x1b[31m[!] Error : File ' ./scripts/better-sqlite3/electron_better_sqlite3_"$1".node ' not found \x1b[0m"
  # fi


  echo "[+] Rebuilding better-sqlite3 "
  # cp ./scripts/better-sqlite3/electron_better_sqlite3_v89.node ./node_modules/better-sqlite3/build/Release/better_sqlite3.node
  if [ -f '../dexcalibur-ui/dxc-web/node_modules/.bin/electron-rebuild' ]; then
    echo 'SKIPPED'
  #  ../dexcalibur-ui/dxc-web/node_modules/.bin/electron-rebuild --module-dir ./node_modules/better-sqlite3
  fi

  echo "[+] Copying default file ' ./scripts/better-sqlite3/electron_better_sqlite3.node ' "
  # cp ./node_modules/better-sqlite3/build/Release/better_sqlite3.node ./dist/node_modules/better-sqlite3/build/Release/better_sqlite3.node
fi


# if apple silicon, do codesign
if [[ `uname -m` == 'arm64' ]]; then
  echo "[+] Doing ad-hoc code signing "
  codesign --force -s "le_potager" ./dist/node_modules/frida/build/Release/frida_binding.node
  codesign --force -s "le_potager" ./dist/node_modules/better-sqlite3/build/Release/better_sqlite3.node
fi


# if dexcalibur-ui is present, update symbolic link
if [ -f '../dexcalibur-ui/dxc-web/package.json' ]; then
    echo "[+] Removing : "$PWD'/../dexcalibur-ui/dxc-web/node_modules/dexcalibur-ts'
    rm -r $PWD/../dexcalibur-ui/dxc-web/node_modules/dexcalibur-ts

    echo "[+] Make symbolic link between 'dexcalibur-ts/dist' and 'dexcalibur-ui/dxc-web/node_modules/dexcalibur-ts' "
    ln -s $PWD/dist $PWD/../dexcalibur-ui/dxc-web/node_modules/dexcalibur-ts
fi