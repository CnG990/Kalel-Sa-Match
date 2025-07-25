# Script de maintenance Backend
# Usage: .\maintenance-backend.ps1 [on|off]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("on", "off")]
    [string]$Action
)

Set-Location Backend

if ($Action -eq "on") {
    Write-Host "🔧 Activation du mode maintenance..." -ForegroundColor Yellow
    php artisan down --message="Maintenance en cours" --retry=60
    Write-Host "✅ Mode maintenance activé" -ForegroundColor Green
} else {
    Write-Host "🚀 Désactivation du mode maintenance..." -ForegroundColor Green
    php artisan up
    Write-Host "✅ Mode maintenance désactivé" -ForegroundColor Green
}

Set-Location .. 