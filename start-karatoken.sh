#!/bin/bash
# Karatoken Auto Start Script
# Usage: ./start-karatoken.sh

cd /workspace || { echo "Project directory not found!"; exit 1; }

if [ -f package.json ]; then
    echo "Installing dependencies..."
    if [ -f yarn.lock ]; then
        yarn install
    elif [ -f pnpm-lock.yaml ]; then
        pnpm install
    else
        npm install
    fi
    echo "Starting the project..."
    if [ -f yarn.lock ]; then
        yarn start
    elif [ -f pnpm-lock.yaml ]; then
        pnpm start
    else
        npm start
    fi
else
    echo "package.json not found! Please check your project directory."
    exit 1
fi