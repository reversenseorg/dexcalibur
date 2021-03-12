#!/bin/sh
echo "[+] Removing ./dist folder"
rm -r ./dist

echo "[+] Transpiling sources to JS"
mkdir ./dist
cp ./package.json ./dist/package.json
cp ./package.json ./dist/dexcalibur-ts/package.json
tsc

echo "[+] Copying files"
grunt build


echo "[+] Move files : hook requirements, etc .."
mv ./dist/src/requires ./dist/dexcalibur-ts/src/requires
