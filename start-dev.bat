@echo off
title Terrains Synthétiques - Serveurs de Développement
cls

echo.
echo ========================================
echo    TERRAINS SYNTHETIQUES - DEV
echo ========================================
echo.

echo [1/2] Démarrage Backend Laravel (Port 8000)...
start "Backend Laravel" cmd /c "cd Backend && php artisan serve --host=127.0.0.1 --port=8000"

timeout /t 3 /nobreak >nul

echo [2/2] Démarrage Frontend React (Port 5173)...
start "Frontend React" cmd /c "cd Frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 5 /nobreak >nul

echo.
echo ✅ Serveurs démarrés !
echo.
echo 📱 Frontend : http://127.0.0.1:5173
echo 🔧 Backend  : http://127.0.0.1:8000
echo 🗺️ Carte    : http://127.0.0.1:5173/dashboard/map
echo.
echo Appuyez sur une touche pour ouvrir la carte...
pause >nul

start "" "http://127.0.0.1:5173/dashboard/map"

echo.
echo 🚀 Développement en cours...
echo Fermez cette fenêtre pour arrêter les serveurs.
pause >nul 