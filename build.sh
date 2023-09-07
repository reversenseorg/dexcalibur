#!/usr/bin/env zsh
echo "[*] Setup env"
# nvm use
echo "[*] Reinstall frida-node & better-sqlite3"
if [[ ! -z "$DXC_CICD_FRIDA_VERSION" ]]; then
  npm uninstall frida && npm install "frida@$DXC_CICD_FRIDA_VERSION"
else
  npm uninstall frida && npm install frida
fi

npm rebuild better-sqlite3@8.0.1

echo "[*] Rebuild"

if [[ $DXC_USE_ARTIFACTS != 1 ]]; then
  DXC_USE_ARTIFACTS=0
fi

npm run build