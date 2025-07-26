Write-Host "========================================" -ForegroundColor Green
Write-Host "Demarrage du serveur Laravel" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Demarrage du serveur Laravel sur le port 8000..." -ForegroundColor Yellow
Write-Host ""

# Changer vers le répertoire Backend
Set-Location "Backend"

# Démarrer le serveur Laravel
php artisan serve --host=0.0.0.0 --port=8000

Write-Host ""
Write-Host "Serveur Laravel demarre sur http://localhost:8000" -ForegroundColor Green
Write-Host "Appuyez sur Ctrl+C pour arreter" -ForegroundColor Red 