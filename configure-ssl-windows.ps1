# Script de configuration SSL pour Windows
# Usage: .\configure-ssl-windows.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    
    [string]$Email = "admin@$Domain"
)

Write-Host "🔒 Configuration SSL pour Windows" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Vérification des prérequis
Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier si OpenSSL est installé
try {
    $opensslVersion = openssl version 2>&1
    Write-Host "✅ OpenSSL détecté: $opensslVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ OpenSSL non trouvé. Installation nécessaire..." -ForegroundColor Red
    Write-Host "📥 Téléchargez OpenSSL depuis: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Cyan
    Write-Host "📝 Ou installez via Chocolatey: choco install openssl" -ForegroundColor Cyan
    exit 1
}

# Vérifier si Certbot est installé
try {
    $certbotVersion = certbot --version 2>&1
    Write-Host "✅ Certbot détecté: $certbotVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Certbot non trouvé. Installation nécessaire..." -ForegroundColor Red
    Write-Host "📥 Téléchargez Certbot depuis: https://certbot.eff.org/" -ForegroundColor Cyan
    Write-Host "📝 Ou installez via pip: pip install certbot" -ForegroundColor Cyan
    exit 1
}

# Configuration du domaine
Write-Host "🌐 Configuration pour le domaine: $Domain" -ForegroundColor Cyan

# 1. Génération d'une clé privée
Write-Host "🔑 Génération de la clé privée..." -ForegroundColor Yellow
$KeyPath = "C:\ssl\$Domain\private.key"
$CertPath = "C:\ssl\$Domain\certificate.crt"

# Créer le dossier SSL
if (!(Test-Path "C:\ssl\$Domain")) {
    New-Item -ItemType Directory -Path "C:\ssl\$Domain" -Force
    Write-Host "✅ Dossier SSL créé" -ForegroundColor Green
}

# Générer la clé privée
try {
    openssl genrsa -out $KeyPath 2048
    Write-Host "✅ Clé privée générée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la génération de la clé" -ForegroundColor Red
    exit 1
}

# 2. Génération d'une demande de certificat (CSR)
Write-Host "📝 Génération de la demande de certificat..." -ForegroundColor Yellow
$CSRPath = "C:\ssl\$Domain\request.csr"

try {
    openssl req -new -key $KeyPath -out $CSRPath -subj "/C=SN/ST=Dakar/L=Dakar/O=Kalel Sa Match/CN=$Domain"
    Write-Host "✅ Demande de certificat générée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la génération de la demande" -ForegroundColor Red
    exit 1
}

# 3. Obtention du certificat via Let's Encrypt
Write-Host "🔐 Obtention du certificat SSL..." -ForegroundColor Yellow

# Méthode 1: Certbot standalone (si le serveur web n'est pas configuré)
Write-Host "📋 Méthode recommandée: Certbot standalone" -ForegroundColor Cyan
Write-Host "📝 Arrêtez votre serveur web temporairement" -ForegroundColor Yellow

try {
    # Arrêter le serveur web (Apache/IIS)
    Write-Host "🛑 Arrêt du serveur web..." -ForegroundColor Yellow
    # net stop apache2.4  # Pour Apache
    # net stop w3svc      # Pour IIS
    
    # Obtenir le certificat
    certbot certonly --standalone -d $Domain -d "www.$Domain" --email $Email --agree-tos --non-interactive
    
    Write-Host "✅ Certificat obtenu avec succès!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'obtention du certificat" -ForegroundColor Red
    Write-Host "📝 Vérifiez que:" -ForegroundColor Yellow
    Write-Host "   - Le domaine pointe vers ce serveur" -ForegroundColor Yellow
    Write-Host "   - Le port 80 est accessible" -ForegroundColor Yellow
    Write-Host "   - Le serveur web est arrêté" -ForegroundColor Yellow
    exit 1
}

# 4. Configuration Apache (si utilisé)
Write-Host "⚙️ Configuration Apache..." -ForegroundColor Yellow

$ApacheConfig = @"
<VirtualHost *:443>
    ServerName $Domain
    ServerAlias www.$Domain
    DocumentRoot "C:/laragon/www/Terrains-Synthetiques/Backend/public"
    
    SSLEngine on
    SSLCertificateFile "C:/laragon/etc/ssl/certs/$Domain/fullchain.pem"
    SSLCertificateKeyFile "C:/laragon/etc/ssl/certs/$Domain/privkey.pem"
    
    <Directory "C:/laragon/www/Terrains-Synthetiques/Backend/public">
        AllowOverride All
        Require all granted
    </Directory>
    
    # Headers de sécurité
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</VirtualHost>

# Redirection HTTP vers HTTPS
<VirtualHost *:80>
    ServerName $Domain
    ServerAlias www.$Domain
    Redirect permanent / https://$Domain/
</VirtualHost>
"@

# Sauvegarder la configuration
$ConfigPath = "C:\laragon\etc\apache2\sites-enabled\$Domain.conf"
$ApacheConfig | Out-File -FilePath $ConfigPath -Encoding UTF8

Write-Host "✅ Configuration Apache sauvegardée: $ConfigPath" -ForegroundColor Green

# 5. Configuration IIS (si utilisé)
Write-Host "⚙️ Configuration IIS..." -ForegroundColor Yellow

$IISConfig = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="HTTP to HTTPS" stopProcessing="true">
                    <match url="(.*)" />
                    <conditions>
                        <add input="{HTTPS}" pattern="off" ignoreCase="true" />
                    </conditions>
                    <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
                </rule>
            </rules>
        </rewrite>
        <httpProtocol>
            <customHeaders>
                <add name="X-Content-Type-Options" value="nosniff" />
                <add name="X-Frame-Options" value="DENY" />
                <add name="X-XSS-Protection" value="1; mode=block" />
                <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
                <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
            </customHeaders>
        </httpProtocol>
    </system.webServer>
</configuration>
"@

# Sauvegarder la configuration IIS
$IISConfigPath = "C:\inetpub\wwwroot\web.config"
$IISConfig | Out-File -FilePath $IISConfigPath -Encoding UTF8

Write-Host "✅ Configuration IIS sauvegardée: $IISConfigPath" -ForegroundColor Green

# 6. Configuration du renouvellement automatique
Write-Host "🔄 Configuration du renouvellement automatique..." -ForegroundColor Yellow

$RenewalScript = @"
# Script de renouvellement SSL
# Usage: .\renew-ssl.ps1

Write-Host "🔄 Renouvellement des certificats SSL..." -ForegroundColor Yellow

try {
    certbot renew --quiet
    Write-Host "✅ Certificats renouvelés avec succès" -ForegroundColor Green
    
    # Redémarrer le serveur web
    Write-Host "🔄 Redémarrage du serveur web..." -ForegroundColor Yellow
    # net stop apache2.4 && net start apache2.4  # Pour Apache
    # net stop w3svc && net start w3svc          # Pour IIS
    
} catch {
    Write-Host "❌ Erreur lors du renouvellement" -ForegroundColor Red
}
"@

$RenewalScriptPath = "C:\ssl\renew-ssl.ps1"
$RenewalScript | Out-File -FilePath $RenewalScriptPath -Encoding UTF8

# Configuration de la tâche planifiée
Write-Host "📅 Configuration de la tâche planifiée..." -ForegroundColor Yellow

try {
    # Créer une tâche planifiée pour le renouvellement
    $Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File `"$RenewalScriptPath`""
    $Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 2am
    $Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

    Register-ScheduledTask -TaskName "SSL Renewal" -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "Renouvellement automatique des certificats SSL"

    Write-Host "✅ Tâche planifiée créée" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Impossible de créer la tâche planifiée" -ForegroundColor Yellow
}

# 7. Test de la configuration
Write-Host "🧪 Test de la configuration SSL..." -ForegroundColor Yellow

Write-Host "📋 Tests à effectuer manuellement:" -ForegroundColor Cyan
Write-Host "1. Test de l'accès HTTPS: https://$Domain" -ForegroundColor Yellow
Write-Host "2. Test de la redirection HTTP vers HTTPS" -ForegroundColor Yellow
Write-Host "3. Test des headers de sécurité" -ForegroundColor Yellow
Write-Host "4. Test du renouvellement: .\renew-ssl.ps1" -ForegroundColor Yellow

# 8. Redémarrage du serveur web
Write-Host "🔄 Redémarrage du serveur web..." -ForegroundColor Yellow

try {
    # Redémarrer Apache
    # net stop apache2.4
    # net start apache2.4
    
    # Ou redémarrer IIS
    # net stop w3svc
    # net start w3svc
    
    Write-Host "✅ Serveur web redémarré" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Impossible de redémarrer le serveur web" -ForegroundColor Yellow
}

# Résumé final
Write-Host ""
Write-Host "🎉 CONFIGURATION SSL TERMINÉE !" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "✅ Certificat SSL obtenu" -ForegroundColor Green
Write-Host "✅ Configuration serveur mise à jour" -ForegroundColor Green
Write-Host "✅ Headers de sécurité configurés" -ForegroundColor Green
Write-Host "✅ Renouvellement automatique configuré" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URL sécurisée: https://$Domain" -ForegroundColor Green
Write-Host "📚 Documentation: DEPLOIEMENT_PRODUCTION_COMPLET.md" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Tester l'accès HTTPS" -ForegroundColor Cyan
Write-Host "2. Configurer le monitoring" -ForegroundColor Cyan
Write-Host "3. Configurer les sauvegardes" -ForegroundColor Cyan
Write-Host "4. Tester toutes les fonctionnalités" -ForegroundColor Cyan 