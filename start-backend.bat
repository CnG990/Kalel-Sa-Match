@echo off
echo ========================================
echo    Demarrage du serveur Laravel
echo    Terrains Synthetiques Dakar
echo ========================================
echo.

cd Backend

echo Configuration de l'environnement...
php artisan config:clear
php artisan cache:clear

echo.
echo Demarrage du serveur sur http://127.0.0.1:8000
echo Pour arreter le serveur, appuyez sur Ctrl+C
echo.

php artisan serve --host=0.0.0.0 --port=8000

pause 