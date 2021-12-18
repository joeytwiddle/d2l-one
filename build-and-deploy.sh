#!/usr/bin/env bash
set -e

# --no-pwa doesn't seem to save much time
# For enabling the PWA, see: https://docs.expo.dev/guides/progressive-web-apps/
cd packages/d2l-expo
yarn build:web
cd ../..

DEPLOY_WEB_APP=1 bash ./deploy-to-production.sh
