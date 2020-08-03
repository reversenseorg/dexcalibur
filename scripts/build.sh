#!/bin/sh
echo "[+] Removing ./dist folder"
rm -r ./dist

echo "[+] Transpiling sources to JS"
mkdir ./dist
cp ./package.json ./dist/package.json
tsc

echo "[+] Copying files"
