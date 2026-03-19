<?php
/**
 * Test HTTP API - Test des endpoints via HTTP
 */

echo "=== TEST HTTP API ===\n\n";

// 1. Test de l'API de santé
echo "1. Test de l'API de santé...\n";
$healthUrl = 'http://127.0.0.1:8000/api/health';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $healthUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo "✓ API de santé: {$data['status']} - {$data['message']}\n";
} else {
    echo "✗ API de santé: Erreur HTTP {$httpCode}\n";
    echo "Réponse: {$response}\n";
}

// 2. Test de l'API notifications (sans authentification)
echo "\n2. Test de l'API notifications (sans authentification)...\n";
$notificationsUrl = 'http://127.0.0.1:8000/api/notifications';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $notificationsUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 401) {
    echo "✓ API notifications: Authentification requise (attendu)\n";
} else {
    echo "✗ API notifications: Code HTTP inattendu {$httpCode}\n";
    echo "Réponse: {$response}\n";
}

// 3. Test de l'API notifications (avec authentification simulée)
echo "\n3. Test de l'API notifications (avec token)...\n";

// D'abord, créons un utilisateur de test via l'API
$loginUrl = 'http://127.0.0.1:8000/api/auth/login';
$loginData = json_encode([
    'email' => 'manager@test.com',
    'password' => 'password',
    'device_name' => 'Test Device'
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $loginUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if (isset($data['data']['token'])) {
        echo "✓ Connexion réussie, token obtenu\n";
        echo "  - Message: {$data['message']}\n";
        echo "  - Utilisateur: {$data['data']['user']['nom']} {$data['data']['user']['prenom']}\n";
        
        // Test avec le token
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $notificationsUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'Content-Type: application/json',
            'Authorization: Bearer ' . $data['data']['token']
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $notifData = json_decode($response, true);
            echo "✓ API notifications avec token: {$httpCode}\n";
            echo "  - Notifications: " . count($notifData['data']) . "\n";
            echo "  - Non lues: {$notifData['unread_count']}\n";
        } else {
            echo "✗ API notifications avec token: Erreur {$httpCode}\n";
            echo "Réponse: {$response}\n";
        }
    } else {
        echo "✗ Pas de token dans la réponse\n";
    }
} else {
    echo "✗ Échec de la connexion: {$httpCode}\n";
    echo "Réponse complète: {$response}\n";
    
    // Afficher les détails de la réponse
    $responseData = json_decode($response, true);
    if ($responseData) {
        echo "Décodé:\n";
        print_r($responseData);
    }
}

echo "\n=== TEST HTTP API TERMINÉ ===\n";
