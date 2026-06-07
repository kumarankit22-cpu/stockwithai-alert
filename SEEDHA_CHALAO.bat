@echo off
title Forex Price Alert
color 0A

echo Forex Price Alert start ho raha hai...
echo.

node --version >nul 2>&1
if errorlevel 1 goto NoNode

if exist node_modules goto RunApp

echo Pehli baar chal raha hai - dependencies install ho rahi hain...
call npm install

:RunApp
call npx electron .
goto End

:NoNode
echo Node.js nahi mila. Pehle BUILD_KRO.bat cha