@echo off
echo ========================================
echo WordPress Portal Page Fix Automation
echo ========================================

cd /d "C:\Users\Aviad\Desktop\web-movne"

echo Installing dependencies...
npm install

echo Installing Playwright browser...
npx playwright install chromium

echo.
echo Choose automation to run:
echo 1. Full diagnostic and fix (comprehensive)
echo 2. Quick portal page creation (reliable)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo Running comprehensive WordPress blank content fix...
    node wordpress-blank-content-fix.js
) else if "%choice%"=="2" (
    echo Running reliable portal page creator...
    node create-portal-page-reliable.js
) else (
    echo Invalid choice. Running reliable portal page creator by default...
    node create-portal-page-reliable.js
)

echo.
echo ========================================
echo Automation completed!
echo Check the generated reports for results.
echo ========================================
pause