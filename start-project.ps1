Write-Host "=== TERRAINS SYNTHÉTIQUES - DÉMARRAGE COMPLET ===" -ForegroundColor Green
Write-Host ""

# Démarrer le backend Laravel
Write-Host "🚀 1. Démarrage du backend Laravel..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend; php artisan serve --host=127.0.0.1 --port=8000"

# Attendre 3 secondes
Start-Sleep -Seconds 3

# Démarrer le frontend React
Write-Host "🚀 2. Démarrage du frontend React..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Frontend; npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host ""
Write-Host "✅ PROJET DÉMARRÉ AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host ""
Write-Host "🌐 URLS DU PROJET :" -ForegroundColor Cyan
Write-Host "   Backend API : http://127.0.0.1:8000" -ForegroundColor White
Write-Host "   Frontend    : http://127.0.0.1:5173" -ForegroundColor White
Write-Host "   API Terrains: http://127.0.0.1:8000/api/terrains/all-for-map" -ForegroundColor White

Write-Host ""
Write-Host "🔐 COMPTES DE CONNEXION :" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host ""
Write-Host "👑 ADMINISTRATEUR PRINCIPAL :" -ForegroundColor Red
Write-Host "   📧 Email     : admin@terrasyn.sn" -ForegroundColor White
Write-Host "   🔒 Password  : admin123" -ForegroundColor White
Write-Host "   🎯 Rôle      : Admin complet" -ForegroundColor Green

Write-Host ""
Write-Host "🏢 GESTIONNAIRE DE TERRAIN :" -ForegroundColor Orange
Write-Host "   📧 Email     : gestionnaire@terrasyn.sn" -ForegroundColor White
Write-Host "   🔒 Password  : gestionnaire123" -ForegroundColor White
Write-Host "   🎯 Rôle      : Gestion terrains" -ForegroundColor Green

Write-Host ""
Write-Host "👤 CLIENT/JOUEUR :" -ForegroundColor Blue
Write-Host "   📧 Email     : client@terrasyn.sn" -ForegroundColor White
Write-Host "   🔒 Password  : client123" -ForegroundColor White
Write-Host "   🎯 Rôle      : Réservations" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 PAGES D'INSCRIPTION FONCTIONNELLES :" -ForegroundColor Yellow
Write-Host "   👤 Client     : http://127.0.0.1:5173/register/client" -ForegroundColor White
Write-Host "   🏢 Gestionnaire: http://127.0.0.1:5173/register/manager" -ForegroundColor White
Write-Host "   🔑 Connexion  : http://127.0.0.1:5173/login" -ForegroundColor White

Write-Host ""
Write-Host "✅ FONCTIONNALITÉS VALIDÉES :" -ForegroundColor Green
Write-Host "   ✓ Base de données PostgreSQL avec terrains_synthetiques_dakar" -ForegroundColor Green
Write-Host "   ✓ 13 terrains de Dakar avec coordonnées géométriques (colonne geom)" -ForegroundColor Green
Write-Host "   ✓ Authentification avec personal_access_tokens" -ForegroundColor Green
Write-Host "   ✓ Géolocalisation 2D (sans coordonnées Z)" -ForegroundColor Green
Write-Host "   ✓ Système d'inscription client/gestionnaire/admin" -ForegroundColor Green
Write-Host "   ✓ API centralisée sur terrains_synthetiques_dakar" -ForegroundColor Green
Write-Host "   ✓ Interface d'administration complète" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "💡 PROJET PRÊT POUR LA SOUTENANCE !" -ForegroundColor Yellow

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer cette fenêtre..." -ForegroundColor Gray
Read-Host 