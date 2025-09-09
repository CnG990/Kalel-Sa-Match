<?php

echo "🔐 Test de l'API d'authentification\n";
echo "=====================================\n\n";

// URL de base de l'API
$baseUrl = 'http://localhost:8000/api';

// Test de connexion avec différents utilisateurs
$testUsers = [
    [
        'email' => 'admin@terrains-dakar.com',
        'password' => 'Admin123!',
        'role' => 'Admin'
    ],
    [
        'email' => 'gestionnaire@terrains-dakar.com',
        'password' => 'Gestionnaire123!',
        'role' => 'Gestionnaire'
    ],
    [
        'email' => 'client@terrains-dakar.com',
        'password' => 'Client123!',
        'role' => 'Client'
    ],
    [
        'email' => 'admin@terrasyn.sn',
        'password' => 'admin123',
        'role' => 'Admin Terrasyn'
    ]
];

foreach ($testUsers as $user) {
    echo "🧪 Test de connexion pour {$user['role']}...\n";
    
    // Préparer les données de connexion
    $loginData = [
        'email' => $user['email'],
        'password' => $user['password'],
        'device_name' => 'Test Device'
    ];
    
    // Effectuer la requête de connexion
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/auth/login');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        echo "📋 Réponse complète: " . $response . "\n";
        
        if (isset($data['data']['token'])) {
            echo "✅ Connexion réussie pour {$user['email']}\n";
            echo "   Token: " . substr($data['data']['token'], 0, 50) . "...\n";
            
            // Test de récupération du profil utilisateur
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $baseUrl . '/user');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $data['data']['token'],
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            
            $userResponse = curl_exec($ch);
            $userHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($userHttpCode === 200) {
                $userData = json_decode($userResponse, true);
                echo "   👤 Profil: {$userData['nom']} {$userData['prenom']} (Rôle: {$userData['role']})\n";
            }
        } elseif (isset($data['token'])) {
            echo "✅ Connexion réussie pour {$user['email']}\n";
            echo "   Token: " . substr($data['token'], 0, 50) . "...\n";
        } else {
            echo "❌ Erreur: Token non reçu dans la réponse\n";
        }
    } else {
        echo "❌ Échec de connexion pour {$user['email']} (HTTP {$httpCode})\n";
        if ($response) {
            $errorData = json_decode($response, true);
            if (isset($errorData['message'])) {
                echo "   Erreur: {$errorData['message']}\n";
            }
            echo "   Réponse complète: " . $response . "\n";
        }
    }
    
    echo "\n";
}

echo "🎯 Résumé des tests d'authentification terminé!\n";
echo "📝 Si certains utilisateurs ne peuvent pas se connecter, vérifiez:\n";
echo "   - Les mots de passe dans les seeders\n";
echo "   - La configuration de la base de données\n";
echo "   - Les routes d'API dans routes/api.php\n";
