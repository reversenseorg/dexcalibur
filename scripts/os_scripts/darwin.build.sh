#!/bin/sh
echo "[+] Removing ./dist folder"
rm -rf ./dist

echo "[+] Transpiling sources to JS"
mkdir ./dist
tsc

#echo "[+] Copying package.json"
#cp ./package.json ./dist/dexcalibur-ts/package.json

echo "[+] Copying files"
cp -r ./scripts/ ./dist/scripts
cp -r ./node_modules/ ./dist/node_modules
cp -r ./package.json ./dist/package.json
cp -r ./info.json ./dist/info.json
cp -r ./package-lock.json ./dist/package-lock.json
cp -r ./dexcalibur ./dist/dexcalibur
cp -r ./README.md ./dist/scripts
cp -r ./src/requires ./dist/src/requires

for i in ./inspectors/*/web
do
  # [[ -d "$i" ]] || break
  cp -r $i ./dist/$i
done

if [ "$DXC_TEST" = "1" ]; then
  echo "[+] Test mode detected. Copying ./test folder ..."
  cp -r ./test ./dist/test
fi