@echo off
echo ========================================
echo Demarrage complet: Laravel + ngrok
echo ========================================

echo.
echo Demarrage du serveur Laravel dans le dossier Backend...
echo.

cd Backend
start "Laravel Server" cmd /k "php artisan serve --host=0.0.0.0 --port=8000"

echo.
echo Attente du demarrage de Laravel...
timeout /t 5 /nobreak > nul

echo.
echo Demarrage de ngrok depuis le dossier racine...
echo.

cd ..
start "ngrok Tunnel" cmd /k "ngrok.exe http 8000"

echo.
echo ========================================
echo CONFIGURATION POUR VERCEL
echo ========================================
echo.
echo 1. Attendez que ngrok affiche l'URL
echo 2. Copiez l'URL ngrok (ex: https://abc123.ngrok-free.app)
echo 3. Dans votre frontend Vercel, utilisez:
echo    const API_URL = 'URL_NGROK/api';
echo 4. Testez depuis https://kalel-sa-match.vercel.app
echo.
echo Les deux terminaux sont maintenant ouverts.
echo Gardez-les ouverts pour que tout fonctionne.
echo.
echo Appuyez sur une touche pour fermer ce guide...
pause > nul 