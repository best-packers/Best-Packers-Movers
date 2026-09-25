@echo off
setlocal enabledelayedexpansion
title Upload BestPackerMovers to GitHub (Auto-Vercel Deploy)

:: Ensure current working directory is the script directory
cd /d "%~dp0"

echo ===============================================================================
echo        BESTPACKERMOVERS.COM - 1-CLICK GITHUB ^& VERCEL DEPLOYMENT ENGINE
echo ===============================================================================
echo.
echo  Working Directory : %CD%
echo  Target Repository : https://github.com/best-packers/Best-Packers-Movers.git
echo  Target Branch     : main
echo.
echo ===============================================================================

:: 1. Mark directory as safe in Git configuration
echo [1/5] Configuring Git environment...
git config --global --add safe.directory "%CD%" 2>nul

:: 2. Ensure remote origin is set accurately
echo [2/5] Verifying GitHub repository remote...
git remote set-url origin https://github.com/best-packers/Best-Packers-Movers.git 2>nul || git remote add origin https://github.com/best-packers/Best-Packers-Movers.git
git branch -M main

:: 3. Pull latest remote changes to prevent conflicts
echo [3/5] Checking for remote changes (rebase)...
git pull origin main --rebase 2>nul

:: 4. Stage all files (Next.js 14 App Router, components, SQLite DB, scripts)
echo [4/5] Staging all files and directories for production upload...
git add -A

:: 5. Commit with timestamp
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a:%%b)
set "commit_msg=Production Deploy: BestPackerMovers v5.0 Next.js 14 Platform [%DATE% %TIME%]"

echo [5/5] Creating commit and pushing to GitHub...
git commit -m "%commit_msg%" 2>nul
if %errorlevel% neq 0 (
  echo [Info] Working tree clean or already committed. Proceeding to push...
)

echo.
echo Pushing code to GitHub (main branch)...
git push -u origin main

if %errorlevel% equ 0 (
  echo.
  echo ===============================================================================
  echo   SUCCESS: Codebase successfully uploaded to GitHub!
  echo ===============================================================================
  echo.
  echo   GitHub Repository : https://github.com/best-packers/Best-Packers-Movers
  echo   Vercel Trigger    : Vercel will now automatically detect this push,
  echo                       run "next build", and deploy your updates live!
  echo.
  echo ===============================================================================
) else (
  echo.
  echo ===============================================================================
  echo   WARNING: Push encountered an error or needs authentication.
  echo   Retrying push...
  echo ===============================================================================
  git push origin main
)

echo.
echo Press any key to exit...
pause >nul
