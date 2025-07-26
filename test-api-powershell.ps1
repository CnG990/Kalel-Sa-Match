# Script PowerShell pour tester l'API Kalel Sa Match
param(
    [string]$ApiUrl = "https://kalel-sa-match.onrender.com"
)

Write-Host "🚀 Test API Kalel Sa Match - PowerShell" -ForegroundColor Green
Write-Host "📍 URL: $ApiUrl" -ForegroundColor Yellow
Write-Host ""

# Fonction pour tester un endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Endpoint,
        [string]$Method = "GET",
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    $url = "$ApiUrl$Endpoint"
    $headers = @{
        "Accept" = "application/json"
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers -TimeoutSec 30
        } else {
            $jsonBody = if ($Body) { $Body | ConvertTo-Json } else { "{}" }
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers -Body $jsonBody -TimeoutSec 30
        }
        
        $status = "✅"
        $success = $true
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            $status = "✅ (Expected $ExpectedStatus)"
            $success = $true
        } else {
            $status = "❌ (HTTP $statusCode)"
            $success = $false
        }
    }
    
    Write-Host "🔍 $Name... $status" -ForegroundColor $(if ($success) { "Green" } else { "Red" })
    return $success
}

# Tests de base
Write-Host "📋 === TESTS DE BASE ===" -ForegroundColor Cyan
Test-Endpoint "Status API" "/api/status"
Test-Endpoint "Test CORS" "/api/test"
Test-Endpoint "Test CORS Simple" "/api/test-cors"

# Tests des terrains
Write-Host "`n🏟️ === TESTS TERRAINS ===" -ForegroundColor Cyan
Test-Endpoint "Liste des terrains" "/api/terrains"
Test-Endpoint "Terrains pour carte" "/api/terrains/all-for-map"
Test-Endpoint "Terrains populaires" "/api/terrains/popular"

# Tests d'authentification
Write-Host "`n🔐 === TESTS AUTHENTIFICATION ===" -ForegroundColor Cyan
Test-Endpoint "Register (invalide)" "/api/auth/register" "POST" @{ name = "Test"; email = "test@test.com"; password = "123" } 422
Test-Endpoint "Login (invalide)" "/api/auth/login" "POST" @{ email = "test@test.com"; password = "123" } 401

# Tests des endpoints protégés
Write-Host "`n🔒 === TESTS ENDPOINTS PROTÉGÉS ===" -ForegroundColor Cyan
Test-Endpoint "Profile utilisateur" "/api/user/profile" "GET" $null 401
Test-Endpoint "Mes réservations" "/api/reservations/my-reservations" "GET" $null 401
Test-Endpoint "Favoris" "/api/user/favorites" "GET" $null 401

# Tests des endpoints admin
Write-Host "`n👨‍💼 === TESTS ENDPOINTS ADMIN ===" -ForegroundColor Cyan
Test-Endpoint "Dashboard admin" "/api/admin/dashboard-stats" "GET" $null 401
Test-Endpoint "Utilisateurs admin" "/api/admin/users" "GET" $null 401
Test-Endpoint "Terrains admin" "/api/admin/terrains" "GET" $null 401

# Tests des endpoints gestionnaire
Write-Host "`n👷 === TESTS ENDPOINTS GESTIONNAIRE ===" -ForegroundColor Cyan
Test-Endpoint "Terrains gestionnaire" "/api/manager/terrains" "GET" $null 401
Test-Endpoint "Réservations gestionnaire" "/api/manager/reservations" "GET" $null 401

# Tests des notifications
Write-Host "`n🔔 === TESTS NOTIFICATIONS ===" -ForegroundColor Cyan
Test-Endpoint "Notifications" "/api/notifications" "GET" $null 401
Test-Endpoint "Notifications non lues" "/api/notifications/unread-count" "GET" $null 401

# Tests des favoris
Write-Host "`n⭐ === TESTS FAVORIS ===" -ForegroundColor Cyan
Test-Endpoint "Favoris" "/api/favorites" "GET" $null 401

# Tests des analyses
Write-Host "`n📊 === TESTS ANALYSES ===" -ForegroundColor Cyan
Test-Endpoint "Track événement" "/api/analytics/events" "POST" @{ event = "test"; data = @{ test = $true } } 401

# Tests des messages
Write-Host "`n💬 === TESTS MESSAGES ===" -ForegroundColor Cyan
Test-Endpoint "Conversations" "/api/messages/conversations" "GET" $null 401

# Tests des paiements
Write-Host "`n💳 === TESTS PAIEMENTS ===" -ForegroundColor Cyan
Test-Endpoint "Mes paiements" "/api/payments/my-payments" "GET" $null 401

# Test de fallback
Write-Host "`n❓ === TESTS FALLBACK ===" -ForegroundColor Cyan
Test-Endpoint "Endpoint inexistant" "/api/endpoint-inexistant" "GET" $null 404

Write-Host "`n🎯 Tests terminés !" -ForegroundColor Green
Write-Host "📅 Date: $(Get-Date)" -ForegroundColor Yellow 