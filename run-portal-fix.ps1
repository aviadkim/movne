# WordPress Portal Page Fix Automation
# PowerShell Script for Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "WordPress Portal Page Fix Automation" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Set location
Set-Location "C:\Users\Aviad\Desktop\web-movne"

Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

Write-Host "Installing Playwright browser..." -ForegroundColor Green
npx playwright install chromium

Write-Host ""
Write-Host "Choose automation to run:" -ForegroundColor Yellow
Write-Host "1. Full diagnostic and fix (comprehensive)" -ForegroundColor White
Write-Host "2. Quick portal page creation (reliable)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1 or 2)"

switch ($choice) {
    "1" {
        Write-Host "Running comprehensive WordPress blank content fix..." -ForegroundColor Green
        node wordpress-blank-content-fix.js
    }
    "2" {
        Write-Host "Running reliable portal page creator..." -ForegroundColor Green
        node create-portal-page-reliable.js
    }
    default {
        Write-Host "Invalid choice. Running reliable portal page creator by default..." -ForegroundColor Yellow
        node create-portal-page-reliable.js
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Automation completed!" -ForegroundColor Green
Write-Host "Check the generated reports for results." -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

Read-Host "Press Enter to exit"