@echo off
echo ===================================================
echo   Pushing BestPackersMovers Codebase to GitHub
echo ===================================================
echo.
git add .
set "commit_msg="
set /p "commit_msg=Enter commit message (or press ENTER for default): "
if "%commit_msg%"=="" set "commit_msg=Update BestPackersMovers production codebase"

git commit -m "%commit_msg%"
git branch -M main
git push -u origin main

echo.
echo ===================================================
echo   Upload finished! Check your GitHub repository.
echo ===================================================
pause

