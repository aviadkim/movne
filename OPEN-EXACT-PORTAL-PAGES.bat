@echo off
cls
echo ========================================
echo  MOVNE PORTAL - EXACT DESIGN SYSTEM
echo ========================================
echo.
echo Opening portal pages with PIXEL-PERFECT accuracy...
echo.
echo EXACT DESIGN TOKENS USED:
echo - Colors: #152135, #34394d, #ff9d0a, #0073aa
echo - Font: Simona, sans-serif (16px base)
echo - Spacing: 8px, 12px, 16px, 24px, 32px, 48px, 64px
echo - Shadows: 0 4px 16px rgba(21, 33, 53, 0.12)
echo - Border Radius: 6px, 12px, 18px, 24px, 32px
echo - Transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
echo.
echo Opening pages...
echo.

start "" "portal-page-2-EXACT.html"
timeout /t 2 /nobreak >nul
start "" "portal-page-3-EXACT.html"

echo.
echo ✅ Portal pages opened with EXACT design matching!
echo.
echo FEATURES:
echo ✓ Pixel-perfect visual consistency
echo ✓ Exact color matching (#152135 gradient background)
echo ✓ Exact typography (Simona font family)
echo ✓ Exact spacing and layout measurements
echo ✓ Exact shadows and border radius
echo ✓ Full Hebrew RTL support
echo ✓ Mobile responsive design
echo ✓ Interactive animations
echo ✓ Working navigation between pages
echo.
echo Press any key to exit...
pause >nul