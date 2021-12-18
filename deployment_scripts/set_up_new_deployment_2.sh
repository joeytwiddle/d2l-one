#!/usr/bin/env bash
set -e

# This script is run as root on the server

if [ -z "$NODE_USER" ]
then
	echo "I cannot deploy without a NODE_USER"
	exit 1
fi

nginx -s reload

chown -R "$NODE_USER:$NODE_USER" "/home/${NODE_USER}/d2l-api/"

su - "$NODE_USER" << !!!
set -e

# This script is run as NODE_USER on the server

if ! command -v nvm >/dev/null 2>&1
then
  echo "Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  source ~/.bashrc
fi

mkdir -p ~/logs

cd d2l-api

nvm install
nvm use

if ! which yarn >/dev/null 2>&1
then
  echo "Installing yarn (fast)..."
	npm install -g yarn
fi

if ! which forever >/dev/null 2>&1
then
  echo "Installing forever (slow)..."
	npm install -g forever
fi

yarn install

forever stopall || true

NODE_ENV=production forever start --spinSleepTime "10000" -a -l d2l-api.log -o ~/logs/d2l-api.log -e ~/logs/d2l-api.log .

sleep 5
tail -n 20 ~/logs/d2l-api.log

!!!
