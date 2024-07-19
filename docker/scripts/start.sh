#!/usr/bin/env bash


if [[ ! -f $1/db_ready.lock ]]; then
  if [[ ! $DXC_DB_HOST -eq "" ]]; then
    node ./dist/dexcalibur-adm.mjs server --db-host=$DXC_DB_HOST
  fi

  if [[ ! $DXC_DB_PORT -eq "" ]]; then
    node ./dist/dexcalibur-adm.mjs server --db-port=$DXC_DB_PORT
  fi

  if [[ ! $DXC_DB_CONN -eq "" ]]; then
    node ./dist/dexcalibur-adm.mjs server --db-conn=$DXC_DB_CONN
  fi

  if [[ ! $DXC_DB_CREDS -eq "" ]]; then
    node ./dist/dexcalibur-adm.mjs server --db-creds=$DXC_DB_CREDS
  fi

  DB_READY=$(node ./dist/dexcalibur-adm.mjs server --check-db)
  if [[ ! $DB_READY -eq "" ]]; then
    echo "1" > $1/db_ready.lock
  fi
fi

node ./dist/dexcalibur.js --gui=$DXC_PRODUCTS