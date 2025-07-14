<?php

echo "=== DIAGNOSTIC SIMPLE ===\n\n";

// Test 1: Connexion base de données avec Laravel
try {
    require_once 'vendor/autoload.php';
    $app = require_once 'bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    echo "1. BASE DE DONNÉES\n";
    echo "------------------\n";
    
    // Test connexion
    $pdo = DB::connection()->getPdo();
    echo "✅ Connexion DB OK\n";
    
    // Compter utilisateurs
    $userCount = DB::table('users')->count();
    echo "Users: $userCount\n";
    
    // Compter terrains
    $terrainCount = DB::table('terrains_synthetiques_dakar')->count();
    echo "Terrains: $terrainCount\n";
    
    // Vérifier admin
    $adminCount = DB::table('users')->where('role', 'admin')->count();
    echo "Admins: $adminCount\n";
    
    // Sample terrain data
    echo "\nTerrain sample:\n";
    $terrain = DB::table('terrains_synthetiques_dakar')->first();
    echo "Nom: " . ($terrain->nom ?? 'NULL') . "\n";
    echo "Adresse: " . ($terrain->adresse ?? 'NULL') . "\n";
    
} catch (Exception $e) {
    echo "❌ Erreur DB: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 2: API Terrains
echo "2. API TERRAINS\n";
echo "---------------\n";
$url = 'http://127.0.0.1:8000/api/terrains';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
if ($httpCode == 200) {
    $data = json_decode($response, true);
    if (isset($data['data'])) {
        $count = is_array($data['data']) ? count($data['data']) : count($data['data']['data'] ?? []);
        echo "Terrains récupérés: $count\n";
    }
} else {
    echo "Erreur: $response\n";
}

echo "\n";

// Test 3: Login avec device_name
echo "3. LOGIN ADMIN\n";
echo "--------------\n";
$loginUrl = 'http://127.0.0.1:8000/api/auth/login';
$loginData = json_encode([
    'email' => 'admin@terrasyn.sn',
    'password' => 'password',
    'device_name' => 'admin_test'
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $loginUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Login Status: $httpCode\n";
if ($httpCode == 200) {
    $data = json_decode($response, true);
    if (isset($data['data']['token'])) {
        echo "✅ Token obtenu\n";
        $token = $data['data']['token'];
        
        // Test API Admin avec token
        echo "\n4. API ADMIN USERS\n";
        echo "------------------\n";
        $adminUrl = 'http://127.0.0.1:8000/api/admin/users';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $adminUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "Admin Users Status: $httpCode\n";
        if ($httpCode == 200) {
            $data = json_decode($response, true);
            if (isset($data['data']['data'])) {
                echo "✅ Utilisateurs récupérés: " . count($data['data']['data']) . "\n";
            }
        } else {
            echo "❌ Erreur: $response\n";
        }
        
    } else {
        echo "❌ Token manquant\n";
    }
} else {
    echo "❌ Erreur login: $response\n";
}

echo "\n=== FIN ===\n"; 