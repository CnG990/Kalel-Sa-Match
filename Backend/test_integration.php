<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Terrain;
use App\Models\Notification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

echo "=== TEST D'INTÉGRATION HTTP ===\n\n";

// 1. Créer des données de test
echo "1. Création des données de test...\n";

// Nettoyer la base de données
DB::statement('TRUNCATE TABLE users, terrains_synthetiques_dakar, reservations, notifications RESTART IDENTITY CASCADE');

// Créer un admin
$admin = User::create([
    'nom' => 'Admin',
    'prenom' => 'Test',
    'email' => 'admin@test.com',
    'mot_de_passe' => Hash::make('password'),
    'role' => 'admin',
    'email_verified_at' => now(),
]);

// Créer un manager
$manager = User::create([
    'nom' => 'Manager',
    'prenom' => 'Test',
    'email' => 'manager@test.com',
    'mot_de_passe' => Hash::make('password'),
    'role' => 'gestionnaire',
    'email_verified_at' => now(),
]);

// Créer un terrain
$terrain = Terrain::create([
    'nom' => 'Terrain Test',
    'description' => 'Terrain de test pour les notifications',
    'adresse' => '123 Rue Test',
    'latitude' => 14.7167,
    'longitude' => -17.4677,
    'surface' => 100,
    'type_surface' => 'gazon_synthetique',
    'est_actif' => true,
    'gestionnaire_id' => $manager->id,
    'source_creation' => 'manuel',
]);

echo "✓ Données de test créées\n\n";

// 2. Créer une notification
echo "2. Création d'une notification...\n";

$notification = Notification::create([
    'id' => \Illuminate\Support\Str::uuid(),
    'type' => 'App\Notifications\TerrainAssigned',
    'notifiable_type' => User::class,
    'notifiable_id' => $manager->id,
    'data' => json_encode([
        'terrain_id' => $terrain->id,
        'terrain_nom' => $terrain->nom,
        'admin_name' => $admin->nom . ' ' . $admin->prenom,
        'message' => "Le terrain {$terrain->nom} vous a été assigné par {$admin->nom} {$admin->prenom}"
    ]),
    'read_at' => null,
    'priority' => 'high',
    'channel' => 'database',
    'sent' => true,
    'send_at' => now(),
]);

echo "✓ Notification créée\n\n";

// 3. Tester l'API avec des requêtes HTTP simulées
echo "3. Test des endpoints API...\n";

// Simuler l'authentification
Auth::login($manager);

// Test de l'endpoint /api/notifications
echo "Test de GET /api/notifications...\n";
try {
    $response = app(\App\Http\Controllers\API\NotificationController::class)->index(new \Illuminate\Http\Request());
    $data = json_decode($response->getContent(), true);
    
    if ($data['success']) {
        echo "✓ GET /api/notifications: " . count($data['data']['data']) . " notifications, " . $data['unread_count'] . " non lues\n";
    } else {
        echo "✗ GET /api/notifications: " . $data['message'] . "\n";
    }
} catch (Exception $e) {
    echo "✗ GET /api/notifications: " . $e->getMessage() . "\n";
}

// Test de l'endpoint /api/notifications/{id}/read
echo "Test de POST /api/notifications/{id}/read...\n";
try {
    $response = app(\App\Http\Controllers\API\NotificationController::class)->markAsRead($notification->id);
    $data = json_decode($response->getContent(), true);
    
    if ($data['success']) {
        echo "✓ POST /api/notifications/{id}/read: " . $data['message'] . ", " . $data['unread_count'] . " non lues\n";
    } else {
        echo "✗ POST /api/notifications/{id}/read: " . $data['message'] . "\n";
    }
} catch (Exception $e) {
    echo "✗ POST /api/notifications/{id}/read: " . $e->getMessage() . "\n";
}

// Test de l'endpoint /api/notifications/unread-count
echo "Test de GET /api/notifications/unread-count...\n";
try {
    $response = app(\App\Http\Controllers\API\NotificationController::class)->unreadCount();
    $data = json_decode($response->getContent(), true);
    
    if ($data['success']) {
        echo "✓ GET /api/notifications/unread-count: " . $data['unread_count'] . " notifications non lues\n";
    } else {
        echo "✗ GET /api/notifications/unread-count: " . $data['message'] . "\n";
    }
} catch (Exception $e) {
    echo "✗ GET /api/notifications/unread-count: " . $e->getMessage() . "\n";
}

echo "\n=== TEST D'INTÉGRATION TERMINÉ ===\n";
echo "Admin: {$admin->email} (password)\n";
echo "Manager: {$manager->email} (password)\n";
echo "Terrain: {$terrain->nom}\n";
echo "Notification: {$notification->id}\n";
