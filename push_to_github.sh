#!/bin/bash
echo "==================================================="
echo "  Pushing BestPackersMovers Codebase to GitHub"
echo "==================================================="
echo ""
git add .
read -p "Enter commit message (or press ENTER for default): " commit_msg
if [ -z "$commit_msg" ]; then
  commit_msg="Update BestPackersMovers production codebase"
fi

git commit -m "$commit_msg"
git branch -M main
git push -u origin main

echo ""
echo "==================================================="
echo "  Upload finished! Check your GitHub repository."
echo "==================================================="
