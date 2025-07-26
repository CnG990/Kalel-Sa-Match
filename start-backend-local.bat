@echo off
echo ========================================
echo Demarrage Backend Laravel Local
echo ========================================

echo.
echo Demarrage du serveur sur le port 8000...
echo URL: http://localhost:8000
echo API: http://localhost:8000/api
echo.

cd Backend
php artisan serve --host=0.0.0.0 --port=8000

pause 