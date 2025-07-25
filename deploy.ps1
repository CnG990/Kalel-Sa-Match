# 🚀 Script de Déploiement PowerShell - Terrains Synthétiques Dakar
# Usage: .\deploy.ps1 [production|staging]

param(
    [string]$Environment = "production"
)

# Configuration
$ProjectName = "terrains-synthetiques"
$Domain = "votre-domaine.com"

# Couleurs pour les messages
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

Write-Host "🚀 Déploiement Terrains Synthétiques Dakar" -ForegroundColor $Blue
Write-Host "Environnement: $Environment" -ForegroundColor $Blue
Write-Host ""

# Fonction pour afficher les messages
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Vérifier les prérequis
function Check-Prerequisites {
    Write-Info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js n'est pas installé"
        Write-Host "Téléchargez depuis: https://nodejs.org/" -ForegroundColor $Yellow
        exit 1
    }
    
    # Vérifier npm
    if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm n'est pas installé"
        exit 1
    }
    
    # Vérifier PHP
    if (!(Get-Command php -ErrorAction SilentlyContinue)) {
        Write-Error "PHP n'est pas installé"
        Write-Host "Installez XAMPP ou PHP standalone" -ForegroundColor $Yellow
        exit 1
    }
    
    # Vérifier Composer
    if (!(Get-Command composer -ErrorAction SilentlyContinue)) {
        Write-Error "Composer n'est pas installé"
        Write-Host "Téléchargez depuis: https://getcomposer.org/" -ForegroundColor $Yellow
        exit 1
    }
    
    Write-Success "Tous les prérequis sont installés"
}

# Nettoyer le projet
function Clean-Project {
    Write-Info "Nettoyage du projet..."
    
    # Supprimer les dossiers de développement
    $foldersToRemove = @(
        "node_modules",
        "Backend/vendor",
        "Frontend/node_modules",
        "Frontend/dist"
    )
    
    foreach ($folder in $foldersToRemove) {
        if (Test-Path $folder) {
            Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
            Write-Host "Supprimé: $folder" -ForegroundColor $Yellow
        }
    }
    
    # Nettoyer les caches Laravel
    $cacheFolders = @(
        "Backend/storage/framework/cache/*",
        "Backend/storage/framework/sessions/*",
        "Backend/storage/framework/views/*"
    )
    
    foreach ($folder in $cacheFolders) {
        if (Test-Path $folder) {
            Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
        }
    }
    
    Write-Success "Projet nettoyé"
}

# Installer les dépendances Backend
function Install-BackendDependencies {
    Write-Info "Installation des dépendances Backend..."
    
    Set-Location Backend
    
    # Installer Composer
    composer install --no-dev --optimize-autoloader --no-interaction
    
    # Copier le fichier d'environnement
    if (!(Test-Path .env)) {
        Copy-Item .env.example .env
        Write-Warning "Fichier .env créé à partir de .env.example"
    }
    
    # Générer la clé d'application si nécessaire
    $envContent = Get-Content .env -Raw
    if ($envContent -notmatch "APP_KEY=base64:") {
        php artisan key:generate
        Write-Success "Clé d'application générée"
    }
    
    Set-Location ..
    Write-Success "Dépendances Backend installées"
}

# Installer les dépendances Frontend
function Install-FrontendDependencies {
    Write-Info "Installation des dépendances Frontend..."
    
    Set-Location Frontend
    
    # Installer npm
    npm install --silent
    
    # Build pour la production
    npm run build
    
    Set-Location ..
    Write-Success "Dépendances Frontend installées et build terminé"
}

# Configurer la base de données
function Setup-Database {
    Write-Info "Configuration de la base de données..."
    
    Set-Location Backend
    
    # Exécuter les migrations
    php artisan migrate --force
    
    # Exécuter les seeders
    php artisan db:seed --force
    
    Set-Location ..
    Write-Success "Base de données configurée"
}

# Optimiser pour la production
function Optimize-ForProduction {
    Write-Info "Optimisation pour la production..."
    
    Set-Location Backend
    
    # Cache des configurations
    php artisan config:cache
    
    # Cache des routes
    php artisan route:cache
    
    # Cache des vues
    php artisan view:cache
    
    Set-Location ..
    Write-Success "Application optimisée pour la production"
}

# Configurer les permissions
function Set-Permissions {
    Write-Info "Configuration des permissions..."
    
    # Permissions pour Laravel (Windows)
    $folders = @(
        "Backend/storage",
        "Backend/bootstrap/cache"
    )
    
    foreach ($folder in $folders) {
        if (Test-Path $folder) {
            # Donner les permissions d'écriture
            icacls $folder /grant "Everyone":(OI)(CI)F /T
        }
    }
    
    Write-Success "Permissions configurées"
}

# Créer les fichiers de configuration serveur
function Create-ServerConfigs {
    Write-Info "Création des configurations serveur..."
    
    # Configuration Apache (.htaccess)
    $htaccessContent = @"
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
"@

    Set-Content -Path "Backend/public/.htaccess" -Value $htaccessContent
    
    # Configuration IIS (web.config)
    $webConfigContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="Imported Rule 1" stopProcessing="true">
                    <match url="^(.*)/$" ignoreCase="false" />
                    <conditions>
                        <add input="{REQUEST_FILENAME}" ignoreCase="false" negate="true" />
                    </conditions>
                    <action type="Redirect" redirectType="Permanent" url="/{R:1}" />
                </rule>
                <rule name="Imported Rule 2" stopProcessing="true">
                    <match url="^" ignoreCase="false" />
                    <conditions>
                        <add input="{REQUEST_FILENAME}" ignoreCase="false" negate="true" />
                        <add input="{REQUEST_URI}" pattern="^(.*)/$" ignoreCase="false" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="index.php/{R:0}" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
"@

    Set-Content -Path "Backend/public/web.config" -Value $webConfigContent
    
    Write-Success "Configurations serveur créées"
}

# Créer le script de sauvegarde
function Create-BackupScript {
    Write-Info "Création du script de sauvegarde..."
    
    $backupScript = @"
# Script de sauvegarde - Terrains Synthétiques Dakar
`$backupDir = "C:\backups\terrains-synthetiques"
`$date = Get-Date -Format "yyyyMMdd_HHmmss"

# Créer le répertoire de sauvegarde
New-Item -ItemType Directory -Force -Path `$backupDir

# Sauvegarde de la base de données
mysqldump -u root -p terrains_synthetiques > "`$backupDir\db_backup_`$date.sql"

# Sauvegarde des fichiers
Compress-Archive -Path "C:\xampp\htdocs\terrains-synthetiques" -DestinationPath "`$backupDir\files_backup_`$date.zip" -Force

# Nettoyer les anciennes sauvegardes (garder 7 jours)
Get-ChildItem `$backupDir -Name "*.sql" | Where-Object { (Get-Item `$_).LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item
Get-ChildItem `$backupDir -Name "*.zip" | Where-Object { (Get-Item `$_).LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item

Write-Host "Sauvegarde terminée: `$date"
"@

    Set-Content -Path "backup.ps1" -Value $backupScript
    Write-Success "Script de sauvegarde créé"
}

# Créer le script de monitoring
function Create-MonitoringScript {
    Write-Info "Création du script de monitoring..."
    
    $monitorScript = @"
# Script de monitoring - Terrains Synthétiques Dakar

Write-Host "=== MONITORING TERRAINS SYNTHÉTIQUES ==="
Write-Host "Date: `$(Get-Date)"
Write-Host ""

# Vérifier les services
Write-Host "=== SERVICES ==="
Get-Service -Name "Apache*", "MySQL*" | Select-Object Name, Status

Write-Host ""
Write-Host "=== ESPACE DISQUE ==="
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, @{Name="Size(GB)";Expression={[math]::Round(`$_.Size/1GB,2)}}, @{Name="FreeSpace(GB)";Expression={[math]::Round(`$_.FreeSpace/1GB,2)}}

Write-Host ""
Write-Host "=== MÉMOIRE ==="
Get-WmiObject -Class Win32_OperatingSystem | Select-Object @{Name="TotalMemory(GB)";Expression={[math]::Round(`$_.TotalVisibleMemorySize/1MB,2)}}, @{Name="FreeMemory(GB)";Expression={[math]::Round(`$_.FreePhysicalMemory/1MB,2)}}

Write-Host ""
Write-Host "=== LOGS RÉCENTS ==="
if (Test-Path "C:\xampp\apache\logs\error.log") {
    Get-Content "C:\xampp\apache\logs\error.log" -Tail 5
}
"@

    Set-Content -Path "monitor.ps1" -Value $monitorScript
    Write-Success "Script de monitoring créé"
}

# Créer le fichier README de déploiement
function Create-DeploymentReadme {
    Write-Info "Création du README de déploiement..."
    
    $readmeContent = @"
# 🚀 Guide de Déploiement Windows - Terrains Synthétiques Dakar

## Configuration Post-Déploiement

### 1. Variables d'Environnement
Éditer le fichier `Backend/.env` :
```env
APP_NAME="Terrains Synthétiques Dakar"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=terrains_synthetiques
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

MAPBOX_TOKEN=your_mapbox_token
```

### 2. Configuration XAMPP
- Démarrer Apache et MySQL dans XAMPP Control Panel
- Accéder à http://localhost/phpmyadmin
- Créer la base de données `terrains_synthetiques`

### 3. Configuration IIS (optionnel)
- Installer IIS sur Windows Server
- Configurer le site web
- Pointer vers le dossier du projet

### 4. Sauvegardes
Le script `backup.ps1` est configuré pour :
- Sauvegarder la base de données quotidiennement
- Sauvegarder les fichiers
- Nettoyer les anciennes sauvegardes (7 jours)

### 5. Monitoring
Utiliser `monitor.ps1` pour vérifier :
- Statut des services
- Utilisation des ressources
- Logs d'erreur

## Commandes Utiles

```powershell
# Redémarrer les services
Restart-Service Apache*
Restart-Service MySQL*

# Voir les logs
Get-Content "C:\xampp\apache\logs\access.log" -Tail 50
Get-Content "C:\xampp\apache\logs\error.log" -Tail 50
Get-Content "Backend\storage\logs\laravel.log" -Tail 50

# Mise à jour
git pull
.\deploy.ps1 production

# Sauvegarde manuelle
.\backup.ps1

# Monitoring
.\monitor.ps1
```

## Support
- Logs : `C:\xampp\apache\logs\` et `Backend\storage\logs\`
- Configuration : `Backend\.env`
- Base de données : MySQL sur localhost:3306
"@

    Set-Content -Path "DEPLOYMENT_README.md" -Value $readmeContent
    Write-Success "README de déploiement créé"
}

# Fonction principale
function Main {
    Write-Host "=== DÉPLOIEMENT TERRAINS SYNTHÉTIQUES DAKAR ===" -ForegroundColor $Blue
    Write-Host ""
    
    # Vérifier les prérequis
    Check-Prerequisites
    
    # Nettoyer le projet
    Clean-Project
    
    # Installer les dépendances
    Install-BackendDependencies
    Install-FrontendDependencies
    
    # Configurer la base de données
    Setup-Database
    
    # Optimiser pour la production
    Optimize-ForProduction
    
    # Configurer les permissions
    Set-Permissions
    
    # Créer les configurations
    Create-ServerConfigs
    Create-BackupScript
    Create-MonitoringScript
    Create-DeploymentReadme
    
    Write-Host ""
    Write-Host "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !" -ForegroundColor $Green
    Write-Host ""
    Write-Host "Prochaines étapes :" -ForegroundColor $Blue
    Write-Host "1. Configurer le fichier Backend/.env"
    Write-Host "2. Démarrer XAMPP (Apache + MySQL)"
    Write-Host "3. Configurer les sauvegardes automatiques"
    Write-Host "4. Tester toutes les fonctionnalités"
    Write-Host ""
    Write-Host "Fichiers créés :" -ForegroundColor $Yellow
    Write-Host "- .htaccess (configuration Apache)"
    Write-Host "- web.config (configuration IIS)"
    Write-Host "- backup.ps1 (sauvegardes automatiques)"
    Write-Host "- monitor.ps1 (monitoring)"
    Write-Host "- DEPLOYMENT_README.md (guide complet)"
    Write-Host ""
    Write-Host "🎉 Votre application est prête pour la production !" -ForegroundColor $Green
}

# Exécuter le script
Main 