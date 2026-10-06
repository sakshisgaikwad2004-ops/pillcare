@echo off
title Pillcare Medical Pharmacy Server
echo ========================================================
echo   PILLCARE MEDICAL - Pharmacy & Healthcare Platform
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Using system Node.js
    node src/server.js
) else (
    where agy-node >nul 2>nul
    if %errorlevel% equ 0 (
        echo [OK] Using pre-configured Node runtime (agy-node)
        agy-node src/server.js
    ) else (
        echo [ERROR] Neither 'node' nor 'agy-node' command was found.
        echo Please ensure Node.js is installed or run with agy-node.
        pause
    )
)
