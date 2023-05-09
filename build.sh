#!/usr/bin/env zsh
echo "[*] Setup env"
# nvm use
echo "[*] Reinstall frida-node & better-sqlite3"
npm uninstall frida && npm install frida && npm rebuild better-sqlite3@8.0.1
echo "[*] Rebuild"
DXC_USE_ARTIFACTS=0 npm run build