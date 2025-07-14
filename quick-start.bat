@echo off
echo ================================================================
echo            DEMARRAGE TERRAINS SYNTHETIQUES DAKAR
echo ================================================================

cd Backend
echo 🚀 Démarrage serveur Laravel (port 8000)...
start "Laravel Server" php artisan serve --host=127.0.0.1 --port=8000

timeout /t 3

cd ..\Frontend
echo 🚀 Démarrage serveur React (port 5174)...
start "React Server" npm run dev

echo.
echo ✅ Serveurs en cours de démarrage...
echo 📍 Backend API: http://127.0.0.1:8000
echo 📍 Frontend: http://127.0.0.1:5174
echo.
echo 🗺️ Accédez à la carte: http://127.0.0.1:5174/dashboard/map
echo.
pause 