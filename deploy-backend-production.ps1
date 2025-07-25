# Script de déploiement Backend en production
# Usage: .\deploy-backend-production.ps1

Write-Host "🚀 Déploiement du Backend en production..." -ForegroundColor Green

# Aller dans le dossier Backend
Set-Location Backend

# Vérifier les prérequis
Write-Host "🔍 Vérification des prérequis..." -ForegroundColor Cyan

# Vérifier PHP
try {
    $phpVersion = php -v 2>$null | Select-String "PHP" | Select-Object -First 1
    if ($phpVersion) {
        Write-Host "✅ PHP détecté: $phpVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ PHP non trouvé. Veuillez installer PHP 8.2+" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification de PHP" -ForegroundColor Red
    exit 1
}

# Vérifier Composer
try {
    $composerVersion = composer --version 2>$null
    if ($composerVersion) {
        Write-Host "✅ Composer détecté: $composerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Composer non trouvé. Veuillez installer Composer" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification de Composer" -ForegroundColor Red
    exit 1
}

# Installation des dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Cyan
composer install --no-dev --optimize-autoloader

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

# Configuration de l'environnement
Write-Host "⚙️ Configuration de l'environnement..." -ForegroundColor Cyan

# Copier le fichier .env.example si .env n'existe pas
if (!(Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Fichier .env créé depuis .env.example" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Aucun fichier .env trouvé. Veuillez créer manuellement le fichier .env" -ForegroundColor Yellow
    }
}

# Générer la clé d'application
Write-Host "🔑 Génération de la clé d'application..." -ForegroundColor Cyan
php artisan key:generate --force

# Nettoyer les caches
Write-Host "🗑️ Nettoyage des caches..." -ForegroundColor Cyan
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Créer les dossiers de stockage
Write-Host "📁 Création des dossiers de stockage..." -ForegroundColor Cyan
$dirs = @(
    "storage/framework/cache",
    "storage/framework/sessions",
    "storage/framework/views",
    "storage/logs",
    "bootstrap/cache"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Créé: $dir" -ForegroundColor Green
    }
}

# Définir les permissions (pour Linux/Mac)
if ($IsLinux -or $IsMacOS) {
    Write-Host "🔐 Configuration des permissions..." -ForegroundColor Cyan
    chmod -R 775 storage
    chmod -R 775 bootstrap/cache
}

# Optimiser l'application
Write-Host "⚡ Optimisation de l'application..." -ForegroundColor Cyan
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Créer le lien symbolique pour le stockage
Write-Host "🔗 Création du lien symbolique..." -ForegroundColor Cyan
php artisan storage:link

# Vérifier la base de données
Write-Host "🗄️ Vérification de la base de données..." -ForegroundColor Cyan
php artisan migrate --force

# Exécuter les seeders si nécessaire
Write-Host "🌱 Exécution des seeders..." -ForegroundColor Cyan
php artisan db:seed --force

# Créer les fichiers de configuration serveur
Write-Host "🌐 Configuration du serveur web..." -ForegroundColor Cyan

# Configuration Apache (.htaccess)
$htaccess = @"
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
    AddOutputFilterByType DEFLATE application/json
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

# Headers de sécurité
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
"@

$htaccess | Out-File -FilePath "public/.htaccess" -Encoding UTF8
Write-Host "✅ Fichier .htaccess créé" -ForegroundColor Green

# Configuration Nginx (optionnel)
$nginxConfig = @"
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/project/public;
    index index.php index.html index.htm;

    location / {
        try_files `$uri `$uri/ /index.php?`$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME `$realpath_root`$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
"@

$nginxConfig | Out-File -FilePath "nginx.conf" -Encoding UTF8
Write-Host "✅ Fichier nginx.conf créé" -ForegroundColor Green

# Retourner au dossier racine
Set-Location ..

Write-Host "✅ Déploiement du Backend terminé !" -ForegroundColor Green
Write-Host "🌐 Votre application Laravel est prête pour la production" -ForegroundColor Green
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Configurer votre serveur web (Apache/Nginx)" -ForegroundColor White
Write-Host "   2. Configurer votre base de données PostgreSQL" -ForegroundColor White
Write-Host "   3. Configurer SSL/HTTPS" -ForegroundColor White
Write-Host "   4. Configurer les variables d'environnement (.env)" -ForegroundColor White
Write-Host "   5. Déployer le Frontend React" -ForegroundColor White 