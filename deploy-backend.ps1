# Script de déploiement Backend Laravel - Terrains Synthétiques Dakar
# Auteur: Assistant IA
# Date: 2025-01-25

Write-Host "🚀 Déploiement Backend Laravel - Terrains Synthétiques Dakar" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

# Configuration
$BACKEND_DIR = "Backend"
$ENV_FILE = "$BACKEND_DIR\.env"
$ENV_PROD_FILE = "$BACKEND_DIR\.env.production"

# Fonction pour afficher les étapes
function Write-Step {
    param([string]$Message)
    Write-Host "`n📋 $Message" -ForegroundColor Cyan
}

# Fonction pour vérifier les prérequis
function Check-Prerequisites {
    Write-Step "Vérification des prérequis..."
    
    # Vérifier PHP
    try {
        $phpVersion = php -v 2>$null
        if ($phpVersion) {
            Write-Host "✅ PHP installé" -ForegroundColor Green
        } else {
            Write-Host "❌ PHP non trouvé" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ PHP non trouvé" -ForegroundColor Red
        return $false
    }
    
    # Vérifier Composer
    try {
        $composerVersion = composer -V 2>$null
        if ($composerVersion) {
            Write-Host "✅ Composer installé" -ForegroundColor Green
        } else {
            Write-Host "❌ Composer non trouvé" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Composer non trouvé" -ForegroundColor Red
        return $false
    }
    
    # Vérifier PostgreSQL
    try {
        $psqlVersion = psql --version 2>$null
        if ($psqlVersion) {
            Write-Host "✅ PostgreSQL installé" -ForegroundColor Green
        } else {
            Write-Host "⚠️  PostgreSQL non trouvé - Assurez-vous qu'il est installé" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  PostgreSQL non trouvé - Assurez-vous qu'il est installé" -ForegroundColor Yellow
    }
    
    return $true
}

# Fonction pour créer la configuration de production
function Create-ProductionConfig {
    Write-Step "Création de la configuration de production..."
    
    if (Test-Path $ENV_FILE) {
        Copy-Item $ENV_FILE $ENV_PROD_FILE -Force
        Write-Host "✅ Fichier .env.production créé" -ForegroundColor Green
        
        # Modifier les paramètres pour la production
        $envContent = Get-Content $ENV_PROD_FILE
        $envContent = $envContent -replace 'APP_ENV=local', 'APP_ENV=production'
        $envContent = $envContent -replace 'APP_DEBUG=true', 'APP_DEBUG=false'
        $envContent = $envContent -replace 'APP_URL=http://127.0.0.1:8000', 'APP_URL=https://api.votre-domaine.com'
        
        # Ajouter des configurations de sécurité
        $envContent += @"
`n# Configuration de sécurité pour la production
LOG_CHANNEL=daily
LOG_LEVEL=error
LOG_DAYS=14

# Configuration de cache
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# Configuration de sécurité
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=strict
"@
        
        Set-Content $ENV_PROD_FILE $envContent
        Write-Host "✅ Configuration de production appliquée" -ForegroundColor Green
    } else {
        Write-Host "❌ Fichier .env non trouvé" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Fonction pour installer les dépendances
function Install-Dependencies {
    Write-Step "Installation des dépendances Composer..."
    
    Set-Location $BACKEND_DIR
    
    try {
        # Installer les dépendances de production
        composer install --no-dev --optimize-autoloader --no-interaction
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Dépendances installées avec succès" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        return $false
    }
    
    Set-Location ..
    return $true
}

# Fonction pour configurer la base de données
function Setup-Database {
    Write-Step "Configuration de la base de données..."
    
    Set-Location $BACKEND_DIR
    
    try {
        # Générer la clé d'application
        php artisan key:generate --env=production
        Write-Host "✅ Clé d'application générée" -ForegroundColor Green
        
        # Exécuter les migrations
        php artisan migrate --force --env=production
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migrations exécutées avec succès" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur lors des migrations" -ForegroundColor Red
            return $false
        }
        
        # Exécuter les seeders
        php artisan db:seed --force --env=production
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Seeders exécutés avec succès" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur lors des seeders" -ForegroundColor Red
            return $false
        }
        
    } catch {
        Write-Host "❌ Erreur lors de la configuration de la base de données" -ForegroundColor Red
        return $false
    }
    
    Set-Location ..
    return $true
}

# Fonction pour optimiser l'application
function Optimize-Application {
    Write-Step "Optimisation de l'application pour la production..."
    
    Set-Location $BACKEND_DIR
    
    try {
        # Vider les caches
        php artisan config:clear
        php artisan cache:clear
        php artisan route:clear
        php artisan view:clear
        Write-Host "✅ Caches vidés" -ForegroundColor Green
        
        # Optimiser pour la production
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        Write-Host "✅ Application optimisée pour la production" -ForegroundColor Green
        
        # Créer le lien symbolique pour le stockage
        if (-not (Test-Path "public/storage")) {
            php artisan storage:link
            Write-Host "✅ Lien symbolique de stockage créé" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "❌ Erreur lors de l'optimisation" -ForegroundColor Red
        return $false
    }
    
    Set-Location ..
    return $true
}

# Fonction pour configurer les permissions
function Set-Permissions {
    Write-Step "Configuration des permissions..."
    
    try {
        # Permissions pour le stockage
        $storagePath = "$BACKEND_DIR\storage"
        $bootstrapPath = "$BACKEND_DIR\bootstrap\cache"
        
        # Donner les permissions d'écriture
        icacls $storagePath /grant "Everyone:(OI)(CI)F" /T
        icacls $bootstrapPath /grant "Everyone:(OI)(CI)F" /T
        
        Write-Host "✅ Permissions configurées" -ForegroundColor Green
        
    } catch {
        Write-Host "⚠️  Erreur lors de la configuration des permissions" -ForegroundColor Yellow
    }
}

# Fonction pour créer les fichiers de configuration serveur
function Create-ServerConfig {
    Write-Step "Création des fichiers de configuration serveur..."
    
    # Créer .htaccess pour Apache
    $htaccessContent = @"
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]

# Sécurité
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
"@
    
    Set-Content "$BACKEND_DIR\public\.htaccess" $htaccessContent
    Write-Host "✅ Fichier .htaccess créé" -ForegroundColor Green
    
    # Créer web.config pour IIS
    $webConfigContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="Laravel" stopProcessing="true">
                    <match url="^" ignoreCase="false" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" ignoreCase="false" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" ignoreCase="false" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="index.php" />
                </rule>
            </rules>
        </rewrite>
        <staticContent>
            <mimeMap fileExtension=".json" mimeType="application/json" />
        </staticContent>
    </system.webServer>
</configuration>
"@
    
    Set-Content "$BACKEND_DIR\public\web.config" $webConfigContent
    Write-Host "✅ Fichier web.config créé" -ForegroundColor Green
}

# Fonction pour créer un script de démarrage
function Create-StartupScript {
    Write-Step "Création du script de démarrage..."
    
    $startupScript = @"
@echo off
echo Démarrage du serveur Laravel...
cd Backend
php artisan serve --host=0.0.0.0 --port=8000
pause
"@
    
    Set-Content "start-backend.bat" $startupScript
    Write-Host "✅ Script de démarrage créé (start-backend.bat)" -ForegroundColor Green
}

# Fonction pour créer un script de maintenance
function Create-MaintenanceScript {
    Write-Step "Création du script de maintenance..."
    
    $maintenanceScript = @"
# Script de maintenance Backend
# Usage: .\maintenance-backend.ps1 [on|off]

param(
    [Parameter(Mandatory=`$true)]
    [ValidateSet("on", "off")]
    [string]`$Action
)

Set-Location Backend

if (`$Action -eq "on") {
    Write-Host "🔧 Activation du mode maintenance..." -ForegroundColor Yellow
    php artisan down --message="Maintenance en cours" --retry=60
    Write-Host "✅ Mode maintenance activé" -ForegroundColor Green
} else {
    Write-Host "🚀 Désactivation du mode maintenance..." -ForegroundColor Green
    php artisan up
    Write-Host "✅ Mode maintenance désactivé" -ForegroundColor Green
}

Set-Location ..
"@
    
    Set-Content "maintenance-backend.ps1" $maintenanceScript
    Write-Host "✅ Script de maintenance créé (maintenance-backend.ps1)" -ForegroundColor Green
}

# Fonction principale
function Deploy-Backend {
    Write-Host "`n🚀 Démarrage du déploiement Backend..." -ForegroundColor Green
    
    # Vérifier les prérequis
    if (-not (Check-Prerequisites)) {
        Write-Host "❌ Prérequis non satisfaits. Arrêt du déploiement." -ForegroundColor Red
        return
    }
    
    # Créer la configuration de production
    if (-not (Create-ProductionConfig)) {
        Write-Host "❌ Erreur lors de la création de la configuration." -ForegroundColor Red
        return
    }
    
    # Installer les dépendances
    if (-not (Install-Dependencies)) {
        Write-Host "❌ Erreur lors de l'installation des dépendances." -ForegroundColor Red
        return
    }
    
    # Configurer la base de données
    if (-not (Setup-Database)) {
        Write-Host "❌ Erreur lors de la configuration de la base de données." -ForegroundColor Red
        return
    }
    
    # Optimiser l'application
    if (-not (Optimize-Application)) {
        Write-Host "❌ Erreur lors de l'optimisation." -ForegroundColor Red
        return
    }
    
    # Configurer les permissions
    Set-Permissions
    
    # Créer les fichiers de configuration serveur
    Create-ServerConfig
    
    # Créer les scripts utilitaires
    Create-StartupScript
    Create-MaintenanceScript
    
    Write-Host "`n🎉 Déploiement Backend terminé avec succès !" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
    Write-Host "1. Configurer votre serveur web (Apache/Nginx/IIS)" -ForegroundColor White
    Write-Host "2. Configurer votre base de données PostgreSQL" -ForegroundColor White
    Write-Host "3. Mettre à jour les variables d'environnement" -ForegroundColor White
    Write-Host "4. Tester l'API avec : php artisan serve" -ForegroundColor White
    Write-Host "5. Déployer le Frontend" -ForegroundColor White
    Write-Host "`n📁 Fichiers créés :" -ForegroundColor Cyan
    Write-Host "- Backend\.env.production" -ForegroundColor White
    Write-Host "- Backend\public\.htaccess" -ForegroundColor White
    Write-Host "- Backend\public\web.config" -ForegroundColor White
    Write-Host "- start-backend.bat" -ForegroundColor White
    Write-Host "- maintenance-backend.ps1" -ForegroundColor White
}

# Exécuter le déploiement
Deploy-Backend 