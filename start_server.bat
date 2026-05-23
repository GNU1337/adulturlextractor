@echo off
title Adult URL Extractor Server

if not exist node_modules (
    echo First time setup: Installing dependencies...
    call npm install
)

echo Starting the Vite and Express development server...
cmd /k "npm run dev"
