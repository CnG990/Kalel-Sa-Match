# Terrains Synthétiques - Script de Démarrage Développement
# PowerShell Version

Write-Host ""
Write-Host "========================================"
Write-Host "   TERRAINS SYNTHETIQUES - DEV" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-Not (Test-Path "Backend") -or -Not (Test-Path "Frontend")) {
    Write-Host "❌ Erreur: Répertoires Backend ou Frontend non trouvés" -ForegroundColor Red
    Write-Host "Assurez-vous d'être dans le répertoire racine du projet" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "[1/2] Démarrage Backend Laravel (Port 8000)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd Backend; php artisan serve --host=127.0.0.1 --port=8000" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "[2/2] Démarrage Frontend React (Port 5173)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd Frontend; npm run dev -- --host 127.0.0.1 --port 5173" -WindowStyle Normal

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Serveurs démarrés !" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend : http://127.0.0.1:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend  : http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "🗺️ Carte    : http://127.0.0.1:5173/dashboard/map" -ForegroundColor Cyan
Write-Host ""

# Test de connectivité
Write-Host "⏳ Test de connectivité..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

try {
    $backendTest = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/terrains" -Method GET -TimeoutSec 5
    if ($backendTest.success) {
        Write-Host "✅ Backend: OK - $($backendTest.data.total) terrains trouvés" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Backend: En cours de démarrage..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur une touche pour ouvrir la carte..." -ForegroundColor White
pause

Start-Process "http://127.0.0.1:5173/dashboard/map"

Write-Host ""
Write-Host "🚀 Développement en cours..." -ForegroundColor Green
Write-Host "Fermez cette fenêtre pour terminer." -ForegroundColor Gray
pause 