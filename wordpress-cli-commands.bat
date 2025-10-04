@echo off
echo Starting WordPress CLI operations...

REM Test CLI
php wp-cli.phar --info

REM Try to connect to WordPress
php wp-cli.phar post create --post_type=page --post_title="פורטל משקיעים - עמוד 2" --post_name="portal-page-2" --post_status=publish --url=https://movne.co.il

REM Next command
php wp-cli.phar post create --post_type=page --post_title="פורטל משקיעים - עמוד 3" --post_name="portal-page-3" --post_status=publish --url=https://movne.co.il

REM Next command
php wp-cli.phar post list --post_type=page --format=table --url=https://movne.co.il

REM Next command
php wp-cli.phar option get home --url=https://movne.co.il

REM Next command
php wp-cli.phar theme list --url=https://movne.co.il

echo.
echo WordPress CLI operations completed.
pause
