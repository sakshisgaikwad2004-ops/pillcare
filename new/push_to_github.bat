@echo off
title Push Pillcare Medical to GitHub
echo ========================================================
echo   Pushing Pillcare Medical to GitHub
echo   Account:    sakshisgaikwad2004-ops
echo   Repository: pillcare
echo ========================================================
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   [SUCCESS] Successfully pushed to GitHub!
    echo   URL: https://github.com/sakshisgaikwad2004-ops/pillcare
    echo ========================================================
) else (
    echo.
    echo [NOTE] If you were prompted for a password, please use your
    echo GitHub Personal Access Token (PAT) from:
    echo https://github.com/settings/tokens
)

pause
