#!/bin/sh
echo "[+] Removing ./dist folder"
rm -r ./dist

echo "[+] Transpiling sources to JS"
mkdir ./dist
cp ./package.json ./dist/package.json
cp ./package.json ./dist/dexcalibur-ts/package.json
cp -r ./test ./dist/dexcalibur-ts/test
tsc

echo "[+] Copying files"
grunt build
