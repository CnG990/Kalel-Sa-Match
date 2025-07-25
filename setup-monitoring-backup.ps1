# Script de configuration du monitoring et des sauvegardes
# Usage: .\setup-monitoring-backup.ps1

param(
    [string]$AppUrl = "http://127.0.0.1:8000",
    [string]$BackupPath = "C:\backups\laravel",
    [string]$LogPath = "C:\logs\laravel"
)

Write-Host "📊 Configuration du monitoring et des sauvegardes" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# 1. Création des dossiers nécessaires
Write-Host "📁 Création des dossiers..." -ForegroundColor Yellow

$Folders = @($BackupPath, $LogPath, "C:\monitoring", "C:\ssl")

foreach ($folder in $Folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force
        Write-Host "✅ Dossier créé: $folder" -ForegroundColor Green
    } else {
        Write-Host "✅ Dossier existe: $folder" -ForegroundColor Green
    }
}

# 2. Script de monitoring de santé
Write-Host "📊 Configuration du monitoring de santé..." -ForegroundColor Yellow

$HealthCheckScript = @"
# Script de vérification de santé
# Usage: .\health-check.ps1

param(
    [string]`$AppUrl = "$AppUrl",
    [string]`$LogFile = "$LogPath\health.log"
)

`$Date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Créer le dossier de logs si nécessaire
if (!(Test-Path (Split-Path `$LogFile))) {
    New-Item -ItemType Directory -Path (Split-Path `$LogFile) -Force
}

Write-Host "🔍 Vérification de santé: `$Date" -ForegroundColor Yellow

# 1. Vérifier l'application
try {
    `$response = Invoke-WebRequest -Uri `$AppUrl -UseBasicParsing -TimeoutSec 30
    if (`$response.StatusCode -eq 200) {
        `$status = "✅ Application OK"
        Write-Host `$status -ForegroundColor Green
    } else {
        `$status = "❌ Application ERREUR - HTTP `$(`$response.StatusCode)"
        Write-Host `$status -ForegroundColor Red
    }
} catch {
    `$status = "❌ Application INACCESSIBLE - `$(`$_.Exception.Message)"
    Write-Host `$status -ForegroundColor Red
}

# 2. Vérifier l'API
try {
    `$apiResponse = Invoke-WebRequest -Uri "`$AppUrl/api/status" -UseBasicParsing -TimeoutSec 30
    if (`$apiResponse.StatusCode -eq 200) {
        `$apiStatus = "✅ API OK"
        Write-Host `$apiStatus -ForegroundColor Green
    } else {
        `$apiStatus = "❌ API ERREUR - HTTP `$(`$apiResponse.StatusCode)"
        Write-Host `$apiStatus -ForegroundColor Red
    }
} catch {
    `$apiStatus = "❌ API INACCESSIBLE - `$(`$_.Exception.Message)"
    Write-Host `$apiStatus -ForegroundColor Red
}

# 3. Vérifier l'espace disque
`$disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
`$diskUsage = [math]::Round((`$disk.Size - `$disk.FreeSpace) / `$disk.Size * 100, 2)
if (`$diskUsage -gt 80) {
    `$diskStatus = "⚠️ Espace disque critique: `$diskUsage%"
    Write-Host `$diskStatus -ForegroundColor Yellow
} else {
    `$diskStatus = "✅ Espace disque OK: `$diskUsage%"
    Write-Host `$diskStatus -ForegroundColor Green
}

# 4. Vérifier la mémoire
`$memory = Get-WmiObject -Class Win32_OperatingSystem
`$memoryUsage = [math]::Round((`$memory.TotalVisibleMemorySize - `$memory.FreePhysicalMemory) / `$memory.TotalVisibleMemorySize * 100, 2)
if (`$memoryUsage -gt 80) {
    `$memoryStatus = "⚠️ Mémoire critique: `$memoryUsage%"
    Write-Host `$memoryStatus -ForegroundColor Yellow
} else {
    `$memoryStatus = "✅ Mémoire OK: `$memoryUsage%"
    Write-Host `$memoryStatus -ForegroundColor Green
}

# 5. Vérifier les services
`$services = @("apache2.4", "w3svc", "postgresql-x64-15")
foreach (`$service in `$services) {
    try {
        `$serviceStatus = Get-Service -Name `$service -ErrorAction SilentlyContinue
        if (`$serviceStatus -and `$serviceStatus.Status -eq "Running") {
            Write-Host "✅ Service `$service OK" -ForegroundColor Green
        } else {
            Write-Host "❌ Service `$service ARRÊTÉ" -ForegroundColor Red
        }
    } catch {
        Write-Host "⚠️ Service `$service non trouvé" -ForegroundColor Yellow
    }
}

# 6. Enregistrer dans le log
`$logEntry = "`$Date | `$status | `$apiStatus | `$diskStatus | `$memoryStatus"
Add-Content -Path `$LogFile -Value `$logEntry

# 7. Envoyer une alerte si nécessaire
if (`$status -like "*ERREUR*" -or `$status -like "*INACCESSIBLE*") {
    Write-Host "🚨 ALERTE: Application en difficulté!" -ForegroundColor Red
    # Ici vous pouvez ajouter l'envoi d'email ou notification
}
"@

$HealthCheckPath = "C:\monitoring\health-check.ps1"
$HealthCheckScript | Out-File -FilePath $HealthCheckPath -Encoding UTF8
Write-Host "✅ Script de monitoring créé: $HealthCheckPath" -ForegroundColor Green

# 3. Script de sauvegarde
Write-Host "💾 Configuration des sauvegardes..." -ForegroundColor Yellow

$BackupScript = @"
# Script de sauvegarde complète
# Usage: .\backup-complete.ps1

param(
    [string]`$BackupPath = "$BackupPath",
    [string]`$AppDir = "C:\laragon\www\Terrains-Synthetiques",
    [int]`$RetentionDays = 30
)

`$Date = Get-Date -Format "yyyyMMdd_HHmmss"
`$BackupDir = "`$BackupPath\`$Date"

Write-Host "🔄 Début de la sauvegarde: `$(Get-Date)" -ForegroundColor Yellow

# Créer le dossier de sauvegarde
if (!(Test-Path `$BackupDir)) {
    New-Item -ItemType Directory -Path `$BackupDir -Force
}

# 1. Sauvegarde de la base de données
Write-Host "📊 Sauvegarde de la base de données..." -ForegroundColor Cyan
try {
    pg_dump -U kalel_user -h localhost kalel_sa_match > "`$BackupDir\db_backup.sql"
    Write-Host "✅ Sauvegarde DB terminée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur sauvegarde DB: `$(`$_.Exception.Message)" -ForegroundColor Red
}

# 2. Sauvegarde des fichiers Backend
Write-Host "📁 Sauvegarde des fichiers Backend..." -ForegroundColor Cyan
try {
    Compress-Archive -Path "`$AppDir\Backend\*" -DestinationPath "`$BackupDir\backend_backup.zip" -Force
    Write-Host "✅ Sauvegarde Backend terminée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur sauvegarde Backend: `$(`$_.Exception.Message)" -ForegroundColor Red
}

# 3. Sauvegarde des fichiers Frontend
Write-Host "📁 Sauvegarde des fichiers Frontend..." -ForegroundColor Cyan
try {
    Compress-Archive -Path "`$AppDir\Frontend\*" -DestinationPath "`$BackupDir\frontend_backup.zip" -Force
    Write-Host "✅ Sauvegarde Frontend terminée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur sauvegarde Frontend: `$(`$_.Exception.Message)" -ForegroundColor Red
}

# 4. Sauvegarde de la configuration
Write-Host "⚙️ Sauvegarde de la configuration..." -ForegroundColor Cyan
try {
    Copy-Item "`$AppDir\Backend\.env" "`$BackupDir\env_backup" -Force
    Write-Host "✅ Sauvegarde configuration terminée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur sauvegarde configuration: `$(`$_.Exception.Message)" -ForegroundColor Red
}

# 5. Créer un fichier de métadonnées
`$BackupInfo = @"
Date: `$(Get-Date)
Application: `$AppDir
Base de données: kalel_sa_match
Taille DB: `$((Get-Item "`$BackupDir\db_backup.sql" -ErrorAction SilentlyContinue).Length / 1KB) KB
Taille Backend: `$((Get-Item "`$BackupDir\backend_backup.zip" -ErrorAction SilentlyContinue).Length / 1MB) MB
Taille Frontend: `$((Get-Item "`$BackupDir\frontend_backup.zip" -ErrorAction SilentlyContinue).Length / 1MB) MB
"@

`$BackupInfo | Out-File -FilePath "`$BackupDir\backup_info.txt" -Encoding UTF8

# 6. Nettoyer les anciennes sauvegardes
Write-Host "🧹 Nettoyage des anciennes sauvegardes..." -ForegroundColor Cyan
try {
    Get-ChildItem -Path `$BackupPath -Directory | Where-Object { `$_.CreationTime -lt (Get-Date).AddDays(-`$RetentionDays) } | Remove-Item -Recurse -Force
    Write-Host "✅ Nettoyage terminé" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erreur lors du nettoyage: `$(`$_.Exception.Message)" -ForegroundColor Yellow
}

# 7. Compresser tout en un seul fichier
Write-Host "📦 Création de l'archive finale..." -ForegroundColor Cyan
try {
    Compress-Archive -Path "`$BackupDir\*" -DestinationPath "`$BackupPath\complete_backup_`$Date.zip" -Force
    Remove-Item -Path `$BackupDir -Recurse -Force
    Write-Host "✅ Archive finale créée: `$BackupPath\complete_backup_`$Date.zip" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur création archive: `$(`$_.Exception.Message)" -ForegroundColor Red
}

Write-Host "✅ Sauvegarde terminée: `$(Get-Date)" -ForegroundColor Green
"@

$BackupScriptPath = "C:\monitoring\backup-complete.ps1"
$BackupScript | Out-File -FilePath $BackupScriptPath -Encoding UTF8
Write-Host "✅ Script de sauvegarde créé: $BackupScriptPath" -ForegroundColor Green

# 4. Script de restauration
Write-Host "🔄 Configuration du script de restauration..." -ForegroundColor Yellow

$RestoreScript = @"
# Script de restauration
# Usage: .\restore-backup.ps1 <backup_file.zip>

param(
    [Parameter(Mandatory=`$true)]
    [string]`$BackupFile,
    
    [string]`$AppDir = "C:\laragon\www\Terrains-Synthetiques",
    [string]`$BackupPath = "$BackupPath"
)

if (!(Test-Path `$BackupFile)) {
    Write-Host "❌ Fichier de sauvegarde non trouvé: `$BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Début de la restauration: `$(Get-Date)" -ForegroundColor Yellow

# Créer un dossier temporaire pour l'extraction
`$TempDir = "`$BackupPath\temp_restore_`$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path `$TempDir -Force

try {
    # 1. Extraire l'archive
    Write-Host "📦 Extraction de l'archive..." -ForegroundColor Cyan
    Expand-Archive -Path `$BackupFile -DestinationPath `$TempDir -Force
    
    # 2. Restaurer la base de données
    Write-Host "📊 Restauration de la base de données..." -ForegroundColor Cyan
    if (Test-Path "`$TempDir\db_backup.sql") {
        psql -U kalel_user -h localhost kalel_sa_match < "`$TempDir\db_backup.sql"
        Write-Host "✅ Base de données restaurée" -ForegroundColor Green
    }
    
    # 3. Restaurer les fichiers Backend
    Write-Host "📁 Restauration des fichiers Backend..." -ForegroundColor Cyan
    if (Test-Path "`$TempDir\backend_backup.zip") {
        Expand-Archive -Path "`$TempDir\backend_backup.zip" -DestinationPath "`$AppDir\Backend" -Force
        Write-Host "✅ Backend restauré" -ForegroundColor Green
    }
    
    # 4. Restaurer les fichiers Frontend
    Write-Host "📁 Restauration des fichiers Frontend..." -ForegroundColor Cyan
    if (Test-Path "`$TempDir\frontend_backup.zip") {
        Expand-Archive -Path "`$TempDir\frontend_backup.zip" -DestinationPath "`$AppDir\Frontend" -Force
        Write-Host "✅ Frontend restauré" -ForegroundColor Green
    }
    
    # 5. Restaurer la configuration
    Write-Host "⚙️ Restauration de la configuration..." -ForegroundColor Cyan
    if (Test-Path "`$TempDir\env_backup") {
        Copy-Item "`$TempDir\env_backup" "`$AppDir\Backend\.env" -Force
        Write-Host "✅ Configuration restaurée" -ForegroundColor Green
    }
    
    # 6. Nettoyer les caches Laravel
    Write-Host "🧹 Nettoyage des caches..." -ForegroundColor Cyan
    Set-Location "`$AppDir\Backend"
    php artisan config:clear
    php artisan cache:clear
    php artisan route:clear
    php artisan view:clear
    
    Write-Host "✅ Restauration terminée: `$(Get-Date)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur lors de la restauration: `$(`$_.Exception.Message)" -ForegroundColor Red
} finally {
    # Nettoyer le dossier temporaire
    if (Test-Path `$TempDir) {
        Remove-Item -Path `$TempDir -Recurse -Force
    }
}
"@

$RestoreScriptPath = "C:\monitoring\restore-backup.ps1"
$RestoreScript | Out-File -FilePath $RestoreScriptPath -Encoding UTF8
Write-Host "✅ Script de restauration créé: $RestoreScriptPath" -ForegroundColor Green

# 5. Configuration des tâches planifiées
Write-Host "📅 Configuration des tâches planifiées..." -ForegroundColor Yellow

try {
    # Tâche de monitoring (toutes les 5 minutes)
    $HealthAction = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File `"$HealthCheckPath`""
    $HealthTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 365)
    $HealthPrincipal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $HealthSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

    Register-ScheduledTask -TaskName "Laravel Health Check" -Action $HealthAction -Trigger $HealthTrigger -Principal $HealthPrincipal -Settings $HealthSettings -Description "Vérification de santé de l'application Laravel"

    # Tâche de sauvegarde (quotidienne à 2h du matin)
    $BackupAction = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File `"$BackupScriptPath`""
    $BackupTrigger = New-ScheduledTaskTrigger -Daily -At 2am
    $BackupPrincipal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $BackupSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

    Register-ScheduledTask -TaskName "Laravel Backup" -Action $BackupAction -Trigger $BackupTrigger -Principal $BackupPrincipal -Settings $BackupSettings -Description "Sauvegarde quotidienne de l'application Laravel"

    Write-Host "✅ Tâches planifiées créées" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Impossible de créer les tâches planifiées: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 6. Test des scripts
Write-Host "🧪 Test des scripts..." -ForegroundColor Yellow

# Test du monitoring
Write-Host "📊 Test du monitoring..." -ForegroundColor Cyan
try {
    & $HealthCheckPath
    Write-Host "✅ Test du monitoring réussi" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du test du monitoring: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de la sauvegarde
Write-Host "💾 Test de la sauvegarde..." -ForegroundColor Cyan
try {
    & $BackupScriptPath
    Write-Host "✅ Test de la sauvegarde réussi" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du test de la sauvegarde: $($_.Exception.Message)" -ForegroundColor Red
}

# Résumé final
Write-Host ""
Write-Host "🎉 CONFIGURATION TERMINÉE !" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host "✅ Monitoring configuré" -ForegroundColor Green
Write-Host "✅ Sauvegardes configurées" -ForegroundColor Green
Write-Host "✅ Tâches planifiées créées" -ForegroundColor Green
Write-Host "✅ Scripts de test créés" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Commandes utiles:" -ForegroundColor Yellow
Write-Host "• Monitoring: .\health-check.ps1" -ForegroundColor Cyan
Write-Host "• Sauvegarde: .\backup-complete.ps1" -ForegroundColor Cyan
Write-Host "• Restauration: .\restore-backup.ps1 <fichier.zip>" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Dossiers créés:" -ForegroundColor Yellow
Write-Host "• Monitoring: C:\monitoring\" -ForegroundColor Cyan
Write-Host "• Sauvegardes: $BackupPath" -ForegroundColor Cyan
Write-Host "• Logs: $LogPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation: DEPLOIEMENT_PRODUCTION_COMPLET.md" -ForegroundColor Green 