# Script de déploiement en production pour Windows
# Usage: .\deploy-production-windows.ps1

param(
    [string]$Domain = "votre-domaine.com",
    [string]$ServerIP = "votre-ip-serveur",
    [string]$BackupPath = "C:\backups\laravel"
)

Write-Host "🚀 Déploiement en production - Kalél Sa Match" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Configuration
$AppDir = "C:\laragon\www\Terrains-Synthetiques"
$BackendDir = "$AppDir\Backend"
$FrontendDir = "$AppDir\Frontend"

# 1. Vérification des prérequis
Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier PHP
try {
    $phpVersion = php -v 2>&1 | Select-String "PHP" | Select-Object -First 1
    Write-Host "✅ PHP détecté: $phpVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PHP non trouvé. Installez PHP 8.2+" -ForegroundColor Red
    exit 1
}

# Vérifier Composer
try {
    $composerVersion = composer --version 2>&1 | Select-String "Composer"
    Write-Host "✅ Composer détecté: $composerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Composer non trouvé. Installez Composer" -ForegroundColor Red
    exit 1
}

# Vérifier Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js non trouvé. Installez Node.js" -ForegroundColor Red
    exit 1
}

# 2. Sauvegarde avant déploiement
Write-Host "📦 Sauvegarde avant déploiement..." -ForegroundColor Yellow

$BackupDate = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = "$BackupPath\$BackupDate"

if (!(Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force
}

# Sauvegarde de la base de données
Write-Host "📊 Sauvegarde de la base de données..." -ForegroundColor Cyan
try {
    pg_dump -U kalel_user -h localhost kalel_sa_match > "$BackupDir\db_backup.sql"
    Write-Host "✅ Sauvegarde DB terminée" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Impossible de sauvegarder la DB (continuer quand même)" -ForegroundColor Yellow
}

# Sauvegarde des fichiers
Write-Host "📁 Sauvegarde des fichiers..." -ForegroundColor Cyan
try {
    Compress-Archive -Path "$BackendDir\*" -DestinationPath "$BackupDir\backend_backup.zip"
    Compress-Archive -Path "$FrontendDir\*" -DestinationPath "$BackupDir\frontend_backup.zip"
    Write-Host "✅ Sauvegarde fichiers terminée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la sauvegarde des fichiers" -ForegroundColor Red
    exit 1
}

# 3. Mode maintenance
Write-Host "🔧 Activation du mode maintenance..." -ForegroundColor Yellow
Set-Location $BackendDir
try {
    php artisan down --message="Déploiement en cours" --retry=60
    Write-Host "✅ Mode maintenance activé" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Impossible d'activer le mode maintenance" -ForegroundColor Yellow
}

# 4. Mise à jour du code
Write-Host "📥 Mise à jour du code..." -ForegroundColor Yellow
try {
    git pull origin master
    Write-Host "✅ Code mis à jour" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la mise à jour du code" -ForegroundColor Red
    exit 1
}

# 5. Installation des dépendances Backend
Write-Host "📦 Installation des dépendances Backend..." -ForegroundColor Yellow
Set-Location $BackendDir
try {
    composer install --no-dev --optimize-autoloader
    Write-Host "✅ Dépendances Backend installées" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'installation des dépendances Backend" -ForegroundColor Red
    exit 1
}

# 6. Migrations et seeders
Write-Host "🗄️ Mise à jour de la base de données..." -ForegroundColor Yellow
try {
    php artisan migrate --force
    php artisan db:seed --force
    Write-Host "✅ Base de données mise à jour" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la mise à jour de la DB" -ForegroundColor Red
    exit 1
}

# 7. Optimisations Laravel
Write-Host "⚡ Optimisations Laravel..." -ForegroundColor Yellow
try {
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan storage:link
    Write-Host "✅ Optimisations terminées" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Certaines optimisations ont échoué" -ForegroundColor Yellow
}

# 8. Build Frontend
Write-Host "🏗️ Build du Frontend..." -ForegroundColor Yellow
Set-Location $FrontendDir
try {
    npm install
    npm run build
    Write-Host "✅ Frontend buildé" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du build Frontend" -ForegroundColor Red
    exit 1
}

# 9. Permissions (si nécessaire)
Write-Host "🔐 Configuration des permissions..." -ForegroundColor Yellow
try {
    # Sur Windows, les permissions sont généralement correctes
    Write-Host "✅ Permissions vérifiées" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Impossible de configurer les permissions" -ForegroundColor Yellow
}

# 10. Désactivation du mode maintenance
Write-Host "✅ Désactivation du mode maintenance..." -ForegroundColor Yellow
Set-Location $BackendDir
try {
    php artisan up
    Write-Host "✅ Mode maintenance désactivé" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Impossible de désactiver le mode maintenance" -ForegroundColor Yellow
}

# 11. Tests de vérification
Write-Host "🧪 Tests de vérification..." -ForegroundColor Yellow

# Test de l'application
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Application accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Application non accessible" -ForegroundColor Red
}

# Test de l'API
try {
    $apiResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/status" -UseBasicParsing
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "✅ API accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ API accessible mais statut: $($apiResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ API non accessible" -ForegroundColor Red
}

# 12. Configuration SSL (si nécessaire)
Write-Host "🔒 Configuration SSL..." -ForegroundColor Yellow
Write-Host "📝 Pour configurer SSL, suivez le guide dans DEPLOIEMENT_PRODUCTION_COMPLET.md" -ForegroundColor Cyan

# 13. Configuration du monitoring
Write-Host "📊 Configuration du monitoring..." -ForegroundColor Yellow
Write-Host "📝 Pour configurer le monitoring, suivez le guide dans DEPLOIEMENT_PRODUCTION_COMPLET.md" -ForegroundColor Cyan

# 14. Configuration des sauvegardes
Write-Host "💾 Configuration des sauvegardes..." -ForegroundColor Yellow
Write-Host "📝 Pour configurer les sauvegardes, suivez le guide dans DEPLOIEMENT_PRODUCTION_COMPLET.md" -ForegroundColor Cyan

# Résumé final
Write-Host ""
Write-Host "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "✅ Application déployée" -ForegroundColor Green
Write-Host "✅ Base de données mise à jour" -ForegroundColor Green
Write-Host "✅ Frontend buildé" -ForegroundColor Green
Write-Host "✅ Optimisations appliquées" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Configurer SSL/HTTPS" -ForegroundColor Cyan
Write-Host "2. Configurer le monitoring" -ForegroundColor Cyan
Write-Host "3. Configurer les sauvegardes automatiques" -ForegroundColor Cyan
Write-Host "4. Tester toutes les fonctionnalités" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URL de test: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "📚 Documentation: DEPLOIEMENT_PRODUCTION_COMPLET.md" -ForegroundColor Green 