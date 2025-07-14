<?php

// Script de test pour vérifier l'API admin
echo "=== TEST API ADMIN - UTILISATEURS ===\n";

// Test 1: Endpoint public (sans auth)
$testUrl = 'http://127.0.0.1:8000/api/test';
echo "Test 1: Endpoint de test public\n";
echo "URL: $testUrl\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $testUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// Test 2: Endpoint admin sans authentification
$adminUrl = 'http://127.0.0.1:8000/api/admin/users';
echo "Test 2: Endpoint admin sans authentification\n";
echo "URL: $adminUrl\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $adminUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// Test 3: Vérifier les tables de base de données
echo "Test 3: Vérification base de données\n";

try {
    $pdo = new PDO('pgsql:host=localhost;dbname=terrains_synthetiques', 'postgres', 'password');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Compter les utilisateurs
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total utilisateurs en base: " . $result['total'] . "\n";
    
    // Compter les admins
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE role = 'admin'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total admins en base: " . $result['total'] . "\n";
    
    // Lister quelques utilisateurs
    $stmt = $pdo->query("SELECT id, nom, prenom, email, role FROM users LIMIT 5");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Quelques utilisateurs:\n";
    foreach ($users as $user) {
        echo "- ID: {$user['id']}, Nom: {$user['prenom']} {$user['nom']}, Email: {$user['email']}, Role: {$user['role']}\n";
    }
    
} catch (Exception $e) {
    echo "Erreur BDD: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DU TEST ===\n"; 