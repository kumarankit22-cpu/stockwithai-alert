@echo off
cd /d "%~dp0"
title Forex Price Alert Builder
color 0A
echo [0 of 3] Purani processes band ho rahi hain...
taskkill /F /IM electron.exe /T >nul 2>&1
taskkill /F /IM "ForexPriceAlert*.exe" /T >nul 2>&1
timeout /t 2 /nobreak >nul
if exist dist rmdir /s /q dist
echo [1 of 3] Dependencies install ho rahi hain...
call npm install
if errorlevel 1 goto InstallFail
echo [2 of 3] EXE build ho raha hai... 2 se 3 minute lagenge
call npm run build
if errorlevel 1 goto BuildFail
echo.
echo [3 of 3] BUILD COMPLETE!
echo.
echo =========================================
echo  INSTALLER: dist\StockwithAi Alert Setup 1.0.0.exe
echo  PORTABLE:  dist\StockwithAi Alert 1.0.0.exe
echo =========================================
echo.
echo Client ko sirf INSTALLER wali file bhejo!
pause
exit /b 0
:InstallFail
echo ERROR: npm install fail hua!
pause
exit /b 1
:BuildFail
echo ERROR: Build fail hua!
pause
exit /b 1