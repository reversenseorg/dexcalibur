#!/bin/sh
echo "[+] Removing ./dist folder"
rm -rf ./dist

echo "[+] Transpiling sources to JS"
mkdir ./dist
tsc

#echo "[+] Copying package.json"
#cp ./package.json ./dist/dexcalibur-ts/package.json

echo "[+] Copying agent libs"
if [ $DXC_USE_ARTIFACTS = 0 ]; then
  mkdir ./dist/agent
  cp ../dexcalibur-agent/dxc-agent.*.min.js ./dist/agent/.
else
  #curl --header "Authorization: Bearer $BUILD_HOST_API_TOKEN" -o ./dist/agent/. "$BUILD_HOST/repository/downloadAll/$BUILD_ID_DXCAGENT/.lastSuccessful/"
  mkdir ./dist/tmp
  curl -u "%system.teamcity.auth.userId%:%system.teamcity.auth.password%" -o ./dist/tmp/artifacts.zip "%teamcity.serverUrl%/httpAuth/app/rest/builds/id:%teamcity.build.id%/.lastSuccessful/"
  if [ -f ./dist/agent/artifacts.zip ] ; then
    echo "Artifacts download uccessfully, unzipping ..."
    unzip -d ./dist/agent ./dist/tmp/artifacts.zip
  else
    echo "[!] Artifacts cannot be downloaded : error"
  fi
fi


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