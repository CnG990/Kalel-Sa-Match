<?php

echo "=== DIAGNOSTIC COMPLET - UTILISATEURS ET TERRAINS ===\n\n";

// Test 1: Vérification serveur backend
echo "1. TEST SERVEUR BACKEND\n";
echo "----------------------\n";
$testUrl = 'http://127.0.0.1:8000/api/test';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $testUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Backend API Status: " . ($httpCode == 200 ? "✅ OK ($httpCode)" : "❌ ERREUR ($httpCode)") . "\n";
if ($httpCode == 200) {
    $data = json_decode($response, true);
    echo "Message: " . ($data['message'] ?? 'N/A') . "\n";
}
echo "\n";

// Test 2: Base de données
echo "2. TEST BASE DE DONNÉES\n";
echo "----------------------\n";
try {
    $pdo = new PDO('pgsql:host=localhost;dbname=terrains_synthetiques', 'postgres', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connexion DB: ✅ OK\n";
    
    // Vérifier les tables
    $tables = ['users', 'terrains', 'terrains_synthetiques_dakar', 'reservations', 'paiements'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "Table $table: ✅ {$result['count']} enregistrements\n";
        } catch (Exception $e) {
            echo "Table $table: ❌ " . $e->getMessage() . "\n";
        }
    }
    
    // Vérifier les utilisateurs par rôle
    echo "\nUtilisateurs par rôle:\n";
    $stmt = $pdo->query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['role']}: {$row['count']}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur DB: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 3: API Terrains (public)
echo "3. TEST API TERRAINS (PUBLIC)\n";
echo "-----------------------------\n";
$terrainUrl = 'http://127.0.0.1:8000/api/terrains';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $terrainUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "API Terrains Status: " . ($httpCode == 200 ? "✅ OK ($httpCode)" : "❌ ERREUR ($httpCode)") . "\n";
if ($httpCode == 200) {
    $data = json_decode($response, true);
    if ($data && isset($data['data'])) {
        $terrains = is_array($data['data']) ? $data['data'] : (isset($data['data']['data']) ? $data['data']['data'] : []);
        echo "Terrains récupérés: " . count($terrains) . "\n";
        if (count($terrains) > 0) {
            echo "Premier terrain: " . ($terrains[0]['nom'] ?? 'Nom manquant') . "\n";
        }
    } else {
        echo "❌ Format de réponse inattendu\n";
        echo "Réponse: " . substr($response, 0, 200) . "...\n";
    }
} else {
    echo "Erreur: $response\n";
}
echo "\n";

// Test 4: Authentification admin
echo "4. TEST AUTHENTIFICATION ADMIN\n";
echo "------------------------------\n";
$loginUrl = 'http://127.0.0.1:8000/api/auth/login';
$loginData = json_encode([
    'email' => 'admin@terrasyn.sn',
    'password' => 'password'
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $loginUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Login Admin Status: " . ($httpCode == 200 ? "✅ OK ($httpCode)" : "❌ ERREUR ($httpCode)") . "\n";
$token = null;
if ($httpCode == 200) {
    $data = json_decode($response, true);
    if ($data && isset($data['access_token'])) {
        $token = $data['access_token'];
        echo "Token obtenu: ✅ " . substr($token, 0, 20) . "...\n";
    } else {
        echo "❌ Token manquant dans la réponse\n";
        echo "Réponse: $response\n";
    }
} else {
    echo "Erreur login: $response\n";
}
echo "\n";

// Test 5: API Admin Users (avec token)
if ($token) {
    echo "5. TEST API ADMIN USERS (AVEC TOKEN)\n";
    echo "------------------------------------\n";
    $adminUsersUrl = 'http://127.0.0.1:8000/api/admin/users';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $adminUsersUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "API Admin Users Status: " . ($httpCode == 200 ? "✅ OK ($httpCode)" : "❌ ERREUR ($httpCode)") . "\n";
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        if ($data && isset($data['data']['data'])) {
            echo "Utilisateurs admin récupérés: " . count($data['data']['data']) . "\n";
        } else {
            echo "❌ Format de réponse inattendu\n";
        }
    } else {
        echo "Erreur: $response\n";
    }
    echo "\n";

    // Test 6: API Admin Terrains (avec token)
    echo "6. TEST API ADMIN TERRAINS (AVEC TOKEN)\n";
    echo "---------------------------------------\n";
    $adminTerrainsUrl = 'http://127.0.0.1:8000/api/admin/terrains';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $adminTerrainsUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "API Admin Terrains Status: " . ($httpCode == 200 ? "✅ OK ($httpCode)" : "❌ ERREUR ($httpCode)") . "\n";
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        if ($data && isset($data['data'])) {
            $terrains = is_array($data['data']) ? $data['data'] : [];
            echo "Terrains admin récupérés: " . count($terrains) . "\n";
        } else {
            echo "❌ Format de réponse inattendu\n";
        }
    } else {
        echo "Erreur: $response\n";
    }
    echo "\n";
}

// Test 7: Structure des tables
echo "7. VÉRIFICATION STRUCTURE TABLES\n";
echo "--------------------------------\n";
try {
    // Vérifier la structure de la table users
    $stmt = $pdo->query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
    echo "Colonnes table users:\n";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['column_name']} ({$row['data_type']})\n";
    }
    echo "\n";
    
    // Vérifier la structure de la table terrains_synthetiques_dakar
    $stmt = $pdo->query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'terrains_synthetiques_dakar' ORDER BY ordinal_position");
    echo "Colonnes table terrains_synthetiques_dakar:\n";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['column_name']} ({$row['data_type']})\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur structure: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DU DIAGNOSTIC ===\n"; 