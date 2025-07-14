@echo off
title Diagnostic Problemes - Image Profil et Statistiques
color 0A

echo.
echo ============================================
echo   DIAGNOSTIC PROBLEMES TERRAINS SYNTHETIQUES
echo ============================================
echo.
echo Ce script va diagnostiquer les problemes:
echo - Images de profil gestionnaire
echo - Statistiques des terrains  
echo - Connexions API et base de donnees
echo.

pause

echo.
echo 1. Test du script de diagnostic PHP...
echo =======================================
php test_profile_and_stats.php

echo.
echo 2. Verification des liens symboliques...
echo ========================================
if exist "public\storage" (
    echo    ✅ Lien symbolique public/storage existe
) else (
    echo    ❌ Lien symbolique manquant
    echo    Execution de: php artisan storage:link
    php artisan storage:link
)

echo.
echo 3. Verification des permissions...
echo =================================
if exist "storage\app\public\profiles" (
    echo    ✅ Dossier profiles existe
) else (
    echo    ❌ Dossier profiles manquant
    echo    Creation du dossier...
    mkdir "storage\app\public\profiles"
)

echo.
echo 4. Test de connectivite Laravel...
echo =================================
echo Demarrage temporaire du serveur pour test...
start /b php artisan serve --host=127.0.0.1 --port=8000
timeout /t 3 >nul

echo Test de l'API...
curl -s -o nul -w "Status: %%{http_code}" http://127.0.0.1:8000/api/health
if %ERRORLEVEL% equ 0 (
    echo    ✅ API accessible
) else (
    echo    ❌ API non accessible
)

echo.
echo 5. Verification des fichiers cles...
echo ===================================
if exist "routes\api.php" (
    echo    ✅ routes/api.php existe
) else (
    echo    ❌ routes/api.php manquant
)

if exist ".env" (
    echo    ✅ .env existe
) else (
    echo    ❌ .env manquant
    echo    Copie de .env.example...
    copy ".env.example" ".env"
)

echo.
echo ============================================
echo   SOLUTIONS RAPIDES
echo ============================================
echo.
echo Si des problemes persistent:
echo.
echo 1. Executez ces commandes:
echo    php artisan storage:link
echo    php artisan migrate:fresh --seed
echo    php artisan serve --host=127.0.0.1 --port=8000
echo.
echo 2. Dans le frontend:
echo    - Ouvrir Mon Profil (gestionnaire)
echo    - Cliquer sur l'icone engrenage (Diagnostic)
echo    - Analyser les resultats
echo.
echo 3. Consulter les logs:
echo    - storage/logs/laravel.log
echo    - Console navigateur (F12)
echo.
echo ============================================

echo.
pause
echo.
echo Voulez-vous ouvrir le diagnostic frontend? (O/N)
set /p choice=Choix: 
if /i "%choice%"=="O" (
    echo Ouverture du navigateur...
    start http://localhost:3000/manager/profile
)

echo.
echo Diagnostic termine!
pause 