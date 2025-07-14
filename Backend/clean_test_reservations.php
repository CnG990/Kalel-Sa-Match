<?php
require_once 'vendor/autoload.php';

// Configuration de base
$baseUrl = 'http://127.0.0.1:8000/api';

// Informations de connexion admin
$adminCredentials = [
    'email' => 'admin@terrains-dakar.com',
    'password' => 'Admin123!'
];

echo "=== NETTOYAGE DONNÉES TEST RÉSERVATIONS ===\n\n";

// 1. Connexion admin
echo "1. Connexion admin...\n";
$loginData = json_encode($adminCredentials);
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        'content' => $loginData
    ]
]);

$response = file_get_contents($baseUrl . '/login', false, $context);
$loginResult = json_decode($response, true);

if (!$loginResult || !isset($loginResult['success']) || !$loginResult['success']) {
    die("❌ Erreur de connexion admin\n");
}

$token = $loginResult['data']['token'];
echo "✅ Connexion admin réussie\n\n";

// 2. Récupérer toutes les réservations
echo "2. Récupération des réservations...\n";
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]
    ]
]);

$response = file_get_contents($baseUrl . '/admin/reservations?per_page=100', false, $context);
$reservationsResult = json_decode($response, true);

if (!$reservationsResult || !isset($reservationsResult['success']) || !$reservationsResult['success']) {
    die("❌ Erreur récupération réservations\n");
}

$reservations = $reservationsResult['data']['data'] ?? [];
$stats = $reservationsResult['data']['stats'] ?? null;

echo "✅ Réservations récupérées: " . count($reservations) . "\n";
if ($stats) {
    echo "📊 Statistiques:\n";
    echo "   - Total: {$stats['total']}\n";
    echo "   - En attente: {$stats['en_attente']}\n";
    echo "   - Confirmées: {$stats['confirmees']}\n";
    echo "   - Annulées: {$stats['annulees']}\n";
    echo "   - Terminées: {$stats['terminees']}\n";
}
echo "\n";

// 3. Identifier les réservations potentiellement de test
echo "3. Identification des réservations de test potentielles...\n";

$testReservations = [];
$testCriteria = [
    'email_test' => [],
    'nom_test' => [],
    'montant_suspect' => [],
    'date_future_lointaine' => [],
    'notes_test' => []
];

foreach ($reservations as $reservation) {
    $isTest = false;
    $reasons = [];
    
    // Critère 1: Email contient "test", "example", "demo"
    $email = strtolower($reservation['user']['email']);
    if (strpos($email, 'test') !== false || 
        strpos($email, 'example') !== false || 
        strpos($email, 'demo') !== false ||
        strpos($email, '@test.') !== false ||
        strpos($email, 'fake') !== false) {
        $isTest = true;
        $reasons[] = 'Email de test';
        $testCriteria['email_test'][] = $reservation['id'];
    }
    
    // Critère 2: Nom contient "test", "demo"
    $nom = strtolower($reservation['user']['nom'] . ' ' . $reservation['user']['prenom']);
    if (strpos($nom, 'test') !== false || 
        strpos($nom, 'demo') !== false ||
        strpos($nom, 'exemple') !== false) {
        $isTest = true;
        $reasons[] = 'Nom de test';
        $testCriteria['nom_test'][] = $reservation['id'];
    }
    
    // Critère 3: Montant suspect (0, 1, 99999, etc.)
    if ($reservation['montant_total'] <= 1 || $reservation['montant_total'] >= 999999) {
        $isTest = true;
        $reasons[] = 'Montant suspect (' . $reservation['montant_total'] . ')';
        $testCriteria['montant_suspect'][] = $reservation['id'];
    }
    
    // Critère 4: Date future très lointaine (> 1 an)
    $dateReservation = new DateTime($reservation['date_debut']);
    $maintenant = new DateTime();
    $diff = $maintenant->diff($dateReservation);
    if ($diff->days > 365 && $dateReservation > $maintenant) {
        $isTest = true;
        $reasons[] = 'Date future lointaine (' . $diff->days . ' jours)';
        $testCriteria['date_future_lointaine'][] = $reservation['id'];
    }
    
    // Critère 5: Notes contiennent "test"
    if (isset($reservation['notes']) && 
        strpos(strtolower($reservation['notes']), 'test') !== false) {
        $isTest = true;
        $reasons[] = 'Notes contiennent "test"';
        $testCriteria['notes_test'][] = $reservation['id'];
    }
    
    if ($isTest) {
        $testReservations[] = [
            'reservation' => $reservation,
            'reasons' => $reasons
        ];
    }
}

echo "📋 Réservations identifiées comme potentiellement de test: " . count($testReservations) . "\n\n";

if (count($testReservations) > 0) {
    echo "🔍 Détails des réservations suspectes:\n";
    foreach ($testReservations as $index => $item) {
        $res = $item['reservation'];
        echo "   " . ($index + 1) . ". ID {$res['id']} - {$res['user']['prenom']} {$res['user']['nom']} ({$res['user']['email']})\n";
        echo "      Montant: {$res['montant_total']} FCFA | Date: {$res['date_debut']}\n";
        echo "      Raisons: " . implode(', ', $item['reasons']) . "\n";
        echo "      Terrain: {$res['terrain']['terrain_synthetique']['nom']}\n\n";
    }
    
    echo "📊 Répartition par critères:\n";
    echo "   - Email de test: " . count($testCriteria['email_test']) . "\n";
    echo "   - Nom de test: " . count($testCriteria['nom_test']) . "\n";
    echo "   - Montant suspect: " . count($testCriteria['montant_suspect']) . "\n";
    echo "   - Date future lointaine: " . count($testCriteria['date_future_lointaine']) . "\n";
    echo "   - Notes de test: " . count($testCriteria['notes_test']) . "\n\n";
    
    // Demander confirmation pour suppression
    echo "⚠️ ATTENTION: Cette opération va supprimer définitivement les réservations de test.\n";
    echo "Voulez-vous continuer ? (tapez 'OUI' pour confirmer): ";
    
    // Simulation de confirmation (dans un vrai script, utiliser readline)
    $confirmation = 'NON'; // Par défaut NON pour sécurité
    
    // Pour tester, on peut forcer la confirmation:
    // $confirmation = 'OUI';
    
    if ($confirmation === 'OUI') {
        echo "\n4. Suppression des réservations de test...\n";
        
        $deleted = 0;
        $errors = 0;
        
        foreach ($testReservations as $item) {
            $resId = $item['reservation']['id'];
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'DELETE',
                    'header' => [
                        'Authorization: Bearer ' . $token,
                        'Accept: application/json'
                    ]
                ]
            ]);
            
            $response = file_get_contents($baseUrl . '/admin/reservations/' . $resId, false, $context);
            $deleteResult = json_decode($response, true);
            
            if ($deleteResult && isset($deleteResult['success']) && $deleteResult['success']) {
                echo "   ✅ Réservation {$resId} supprimée\n";
                $deleted++;
            } else {
                echo "   ❌ Erreur suppression réservation {$resId}\n";
                if ($deleteResult && isset($deleteResult['message'])) {
                    echo "      Message: {$deleteResult['message']}\n";
                }
                $errors++;
            }
        }
        
        echo "\n📊 Résultat du nettoyage:\n";
        echo "   - Supprimées: {$deleted}\n";
        echo "   - Erreurs: {$errors}\n";
        
        if ($deleted > 0) {
            echo "\n🎉 Nettoyage terminé ! Les réservations de test ont été supprimées.\n";
        }
        
    } else {
        echo "\n❌ Nettoyage annulé par l'utilisateur.\n";
        echo "💡 Pour effectuer le nettoyage, modifiez le script et changez \$confirmation = 'OUI';\n";
    }
    
} else {
    echo "✅ Aucune réservation de test détectée. La base de données semble propre !\n";
}

echo "\n=== FIN DU NETTOYAGE ===\n";
?> 