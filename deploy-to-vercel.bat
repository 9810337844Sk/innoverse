@echo off
echo ========================================
echo PhotoFly - Deploying to Vercel
echo ========================================
echo.

cd frontend

echo [1/4] Checking for changes...
git status

echo.
echo [2/4] Committing changes...
git add .
git commit -m "Update: Clean branding and notification fixes"

echo.
echo [3/4] Pushing to GitHub...
git push origin main

echo.
echo [4/4] Deploying to Vercel...
vercel --prod

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your app will be live at:
echo https://photo-event-platform.vercel.app
echo.
pause
