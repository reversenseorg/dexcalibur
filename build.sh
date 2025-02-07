#!/bin/sh

echo "[*] Setup env"
# nvm use
echo "[*] Reinstall frida-node & better-sqlite3"
if [[ ! -z "$DXC_CICD_FRIDA_VERSION" ]]; then
  echo "Replace built-in frida-node by new one using DXC_CICD_FRIDA_VERSION constant : frida@$DXC_CICD_FRIDA_VERSION"
  npm uninstall frida && npm install "frida@$DXC_CICD_FRIDA_VERSION"
else
  echo "Replace built-in frida-node by new one with default version"
  npm uninstall frida && npm install frida
fi

echo "Rebuild better-sqlite"
npm rebuild better-sqlite3@8.0.1

echo "[*] Rebuild"

if [[ $DXC_USE_ARTIFACTS != 1 ]]; then
  DXC_USE_ARTIFACTS=0
fi

npm run build