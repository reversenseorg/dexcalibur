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

  if [ -f ./dxc-agent.android.arm64.min.js ] ; then
    echo "[*] dexcalibur-agent artifacts has been set"
    mkdir ./dist/agent
    cp ./dxc-agent.* ./dist/agent/.
  else
    echo "[!] dexcalibur-agent files have not been copied"
    mkdir ./dist/tmp
      if [ "$DXC_CICD_API_AUTH" = "basic" ]; then
        curl -u "$DXC_CICD_API_USER:$DXC_CICD_API_PWD" -o ./dist/tmp/artifacts.zip "$DXC_CICD_HOST/httpAuth/repository/downloadAll/$BUILD_ID_DXCAGENT/.lastSuccessful/"
      else
        curl --header "Authorization: Bearer $DXC_CICD_API_TOKEN" -o ./dist/tmp/artifacts.zip "$DXC_CICD_HOST/repository/downloadAll/$BUILD_ID_DXCAGENT/.lastSuccessful/"
      fi

      if [ -f ./dist/tmp/artifacts.zip ] ; then
        echo "Artifacts download successfully, unzipping ..."
        unzip -d ./dist/agent ./dist/tmp/artifacts.zip
      else
        echo "[!] Artifacts cannot be downloaded : error"
      fi
  fi
fi

# verify dexcalibur-agent files exists
if [ -f ./dist/agent/dxc-agent.android.min.js ] ; then
  echo "[*] dexcalibur-agent files have been copied"
else
  echo "[!] dexcalibur-agent files have not been copied"
fi

echo "[+] Copying files"
cp -r ./scripts/ ./dist/scripts
cp -r ./node_modules/ ./dist/node_modules
cp -r ./package.json ./dist/package.json
cp -r ./info.json ./dist/info.json
cp -r ./dexcalibur ./dist/dexcalibur
cp -r ./README.md ./dist/scripts
cp -r ./src/requires ./dist/src/requires
cp -r ./assets ./dist/assets
cp -r ./thirdparty ./dist/thirdparty

if [ -f ./public ]; then
  cp -r ./public ./dist/public
fi

# static pages hosted by dexcalibur server (no ssr)
cp -r ./src/webserver ./dist/src/webserver

if [ -f "./package-lock.json" ]; then
  cp -r ./package-lock.json ./dist/package-lock.json
fi

for i in ./inspectors/*/web
do
  # [[ -d "$i" ]] || break
  cp -r $i ./dist/$i
done

if [ "$DXC_TEST" = "1" ]; then
  echo "[+] Test mode detected. Copying ./test folder ..."
  cp -r ./test ./dist/test
fi