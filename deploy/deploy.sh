#!/bin/bash

DEPLOY_SERVER="132.249.242.243"
SERVER_FOLDER="html-folder-in-server"

# Building React output
npm install
npm run build

echo "Deploying to ${DEPLOY_SERVER}"
scp -r build/ shatterpoint@${DEPLOY_SERVER}:~/test

echo "Finished copying the build files"