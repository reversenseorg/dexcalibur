#!/usr/bin/env zsh
echo "[*] Setup env"
# nvm use
echo "[*] Reinstall frida-node & better-sqlite3"
npm uninstall frida && npm install frida && npm rebuild better-sqlite3@8.0.1

echo "[*] Rebuild"

if [ $DXC_USE_ARTIFACTS != 1 ]; then
  DXC_USE_ARTIFACTS=0
fi

npm run build