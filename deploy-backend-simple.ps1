# Script de deploiement Backend Laravel - Terrains Synthetiques Dakar
# Auteur: Assistant IA
# Date: 2025-01-25

Write-Host "Deploiement Backend Laravel - Terrains Synthetiques Dakar" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

# Configuration
$BACKEND_DIR = "Backend"
$ENV_FILE = "$BACKEND_DIR\.env"
$ENV_PROD_FILE = "$BACKEND_DIR\.env.production"

# Fonction pour afficher les etapes
function Write-Step {
    param([string]$Message)
    Write-Host "`n$Message" -ForegroundColor Cyan
}

# Fonction pour verifier les prerequis
function Check-Prerequisites {
    Write-Step "Verification des prerequis..."
    
    # Verifier PHP
    try {
        $phpVersion = php -v 2>$null
        if ($phpVersion) {
            Write-Host "OK - PHP installe" -ForegroundColor Green
        } else {
            Write-Host "ERREUR - PHP non trouve" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "ERREUR - PHP non trouve" -ForegroundColor Red
        return $false
    }
    
    # Verifier Composer
    try {
        $composerVersion = composer -V 2>$null
        if ($composerVersion) {
            Write-Host "OK - Composer installe" -ForegroundColor Green
        } else {
            Write-Host "ERREUR - Composer non trouve" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "ERREUR - Composer non trouve" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Fonction pour installer les dependances
function Install-Dependencies {
    Write-Step "Installation des dependances Composer..."
    
    Set-Location $BACKEND_DIR
    
    try {
        # Installer les dependances de production
        composer install --no-dev --optimize-autoloader --no-interaction
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK - Dependances installees avec succes" -ForegroundColor Green
        } else {
            Write-Host "ERREUR - Erreur lors de l'installation des dependances" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "ERREUR - Erreur lors de l'installation des dependances" -ForegroundColor Red
        return $false
    }
    
    Set-Location ..
    return $true
}

# Fonction pour configurer la base de donnees
function Setup-Database {
    Write-Step "Configuration de la base de donnees..."
    
    Set-Location $BACKEND_DIR
    
    try {
        # Generer la cle d'application
        php artisan key:generate
        Write-Host "OK - Cle d'application generee" -ForegroundColor Green
        
        # Executer les migrations
        php artisan migrate --force
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK - Migrations executees avec succes" -ForegroundColor Green
        } else {
            Write-Host "ERREUR - Erreur lors des migrations" -ForegroundColor Red
            return $false
        }
        
        # Executer les seeders
        php artisan db:seed --force
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK - Seeders executes avec succes" -ForegroundColor Green
        } else {
            Write-Host "ERREUR - Erreur lors des seeders" -ForegroundColor Red
            return $false
        }
        
    } catch {
        Write-Host "ERREUR - Erreur lors de la configuration de la base de donnees" -ForegroundColor Red
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
        Write-Host "OK - Caches vides" -ForegroundColor Green
        
        # Optimiser pour la production
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        Write-Host "OK - Application optimisee pour la production" -ForegroundColor Green
        
        # Creer le lien symbolique pour le stockage
        if (-not (Test-Path "public/storage")) {
            php artisan storage:link
            Write-Host "OK - Lien symbolique de stockage cree" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "ERREUR - Erreur lors de l'optimisation" -ForegroundColor Red
        return $false
    }
    
    Set-Location ..
    return $true
}

# Fonction pour creer les fichiers de configuration serveur
function Create-ServerConfig {
    Write-Step "Creation des fichiers de configuration serveur..."
    
    # Creer .htaccess pour Apache
    $htaccessContent = @"
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]

# Securite
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
"@
    
    Set-Content "$BACKEND_DIR\public\.htaccess" $htaccessContent
    Write-Host "OK - Fichier .htaccess cree" -ForegroundColor Green
    
    # Creer web.config pour IIS
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
    Write-Host "OK - Fichier web.config cree" -ForegroundColor Green
}

# Fonction pour creer un script de demarrage
function Create-StartupScript {
    Write-Step "Creation du script de demarrage..."
    
    $startupScript = @"
@echo off
echo Demarrage du serveur Laravel...
cd Backend
php artisan serve --host=0.0.0.0 --port=8000
pause
"@
    
    Set-Content "start-backend.bat" $startupScript
    Write-Host "OK - Script de demarrage cree (start-backend.bat)" -ForegroundColor Green
}

# Fonction principale
function Deploy-Backend {
    Write-Host "`nDemarrage du deploiement Backend..." -ForegroundColor Green
    
    # Verifier les prerequis
    if (-not (Check-Prerequisites)) {
        Write-Host "ERREUR - Prerequis non satisfaits. Arret du deploiement." -ForegroundColor Red
        return
    }
    
    # Installer les dependances
    if (-not (Install-Dependencies)) {
        Write-Host "ERREUR - Erreur lors de l'installation des dependances." -ForegroundColor Red
        return
    }
    
    # Configurer la base de donnees
    if (-not (Setup-Database)) {
        Write-Host "ERREUR - Erreur lors de la configuration de la base de donnees." -ForegroundColor Red
        return
    }
    
    # Optimiser l'application
    if (-not (Optimize-Application)) {
        Write-Host "ERREUR - Erreur lors de l'optimisation." -ForegroundColor Red
        return
    }
    
    # Creer les fichiers de configuration serveur
    Create-ServerConfig
    
    # Creer les scripts utilitaires
    Create-StartupScript
    
    Write-Host "`nSUCCES - Deploiement Backend termine avec succes !" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "Prochaines etapes :" -ForegroundColor Cyan
    Write-Host "1. Configurer votre serveur web (Apache/Nginx/IIS)" -ForegroundColor White
    Write-Host "2. Configurer votre base de donnees PostgreSQL" -ForegroundColor White
    Write-Host "3. Mettre a jour les variables d'environnement" -ForegroundColor White
    Write-Host "4. Tester l'API avec : php artisan serve" -ForegroundColor White
    Write-Host "5. Deployer le Frontend" -ForegroundColor White
    Write-Host "`nFichiers crees :" -ForegroundColor Cyan
    Write-Host "- Backend\public\.htaccess" -ForegroundColor White
    Write-Host "- Backend\public\web.config" -ForegroundColor White
    Write-Host "- start-backend.bat" -ForegroundColor White
}

# Executer le deploiement
Deploy-Backend 