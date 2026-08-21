@echo off
setlocal enabledelayedexpansion
title Push BestPackersMovers to GitHub

:: Change working directory to the directory where this script is located
cd /d "%~dp0"

echo ================================================================
echo   BestPackersMovers - Automated 1-Click GitHub Repository Sync
echo ================================================================
echo.
echo Target Directory: %CD%
echo Target Repository: https://github.com/best-packers/Best-Packers-Movers.git
echo.

:: Mark directory as safe for Git
git config --global --add safe.directory "%CD%" 2>nul

:: Ensure git remote origin is correctly configured
git remote set-url origin https://github.com/best-packers/Best-Packers-Movers.git 2>nul || git remote add origin https://github.com/best-packers/Best-Packers-Movers.git

:: Set branch to main
git branch -M main

:: Sync any remote changes first
echo [1/4] Syncing remote repository...
git pull origin main --rebase 2>nul

:: Stage all files
echo [2/4] Staging all files and directories...
git add -A

:: Commit changes with timestamp
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a:%%b)
set "commit_msg=Production Update: %DATE% %TIME%"

echo [3/4] Creating commit...
git commit -m "%commit_msg%" 2>nul
if %errorlevel% neq 0 (
  echo [Info] Working directory clean or already up to date.
)

:: Push to remote repository
echo [4/4] Uploading full codebase to GitHub repository...
echo.
git push -u origin main

if %errorlevel% equ 0 (
  echo.
  echo ================================================================
  echo   SUCCESS: Codebase successfully published to GitHub!
  echo   Repository: https://github.com/best-packers/Best-Packers-Movers
  echo ================================================================
) else (
  echo.
  echo ================================================================
  echo   Push failed or required credentials. Retrying with force sync...
  echo ================================================================
  git push origin main
)

echo.
echo Press any key to exit...
pause >nul

