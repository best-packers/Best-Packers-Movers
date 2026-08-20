@echo off
setlocal enabledelayedexpansion
title Push BestPackersMovers to GitHub
echo ================================================================
echo   BestPackersMovers - Automated 1-Click GitHub Repository Sync
echo ================================================================
echo.
echo Target Repository: https://github.com/best-packers/Best-Packers-Movers.git
echo.

:: Ensure git remote origin is correctly configured
git remote set-url origin https://github.com/best-packers/Best-Packers-Movers.git 2>nul || git remote add origin https://github.com/best-packers/Best-Packers-Movers.git

:: Check status
echo [1/4] Staging all files...
git add -A

:: Commit changes
set "commit_msg=Production release: Complete SEO-optimized Packers and Movers Directory"
echo [2/4] Committing codebase...
git commit -m "%commit_msg%" 2>nul
if %errorlevel% neq 0 (
  echo [Info] Working tree already clean or commit created.
)

:: Set branch to main
echo [3/4] Switching to main branch...
git branch -M main

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
  echo   NOTE: If authentication prompt appeared or failed, ensure you
  echo   have logged into GitHub CLI or Personal Access Token (PAT).
  echo ================================================================
)

echo.
pause
