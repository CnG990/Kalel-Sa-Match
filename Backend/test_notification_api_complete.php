<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Terrain;
use App\Models\Reservation;
use App\Models\Notification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

echo "=== TEST COMPLET DE L'API DE NOTIFICATIONS ===\n\n";

// 1. Nettoyer et créer des données de test
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

// 2. Tester la création de notifications manuellement
echo "2. Test de création de notifications...\n";

// Créer une notification pour le manager
$notification = Notification::create([
    'id' => \Illuminate\Support\Str::uuid(),
    'type' => 'App\Notifications\TerrainAssigned',
    'notifiable_type' => User::class,
    'notifiable_id' => $manager->id,
    'data' => json_encode([
        'terrain_id' => $terrain->id,
        'terrain_nom' => $terrain->nom,
        'admin_name' => $admin->name,
        'message' => "Le terrain {$terrain->nom} vous a été assigné par {$admin->name}"
    ]),
    'read_at' => null,
    'priority' => 'high',
    'channel' => 'database',
    'sent' => true,
    'send_at' => now(),
]);

echo "✓ Notification créée pour le manager\n";

// 3. Tester l'API de notifications
echo "\n3. Test de l'API de notifications...\n";

// Simuler l'authentification
Auth::login($manager);

// Tester le contrôleur
$controller = app(\App\Http\Controllers\API\NotificationController::class);

try {
    // Test index (récupérer toutes les notifications)
    $response = $controller->index(new \Illuminate\Http\Request());
    echo "✓ API index fonctionne\n";
    
    // Test unread count
    $response = $controller->unreadCount();
    echo "✓ API unread count fonctionne\n";
    
    // Test mark as read
    $response = $controller->markAsRead(new \Illuminate\Http\Request(), $notification->id);
    echo "✓ API mark as read fonctionne\n";
    
} catch (Exception $e) {
    echo "✗ Erreur API: " . $e->getMessage() . "\n";
}

// 4. Vérifier les relations
echo "\n4. Test des relations...\n";

try {
    $managerNotifications = $manager->notifications;
    echo "✓ Relation notifications() fonctionne: " . $managerNotifications->count() . " notifications\n";
    
    foreach ($managerNotifications as $notif) {
        echo "  - Type: {$notif->type}, Lu: " . ($notif->read_at ? 'Oui' : 'Non') . "\n";
    }
} catch (Exception $e) {
    echo "✗ Erreur relation: " . $e->getMessage() . "\n";
}

// 5. Test des scopes
echo "\n5. Test des scopes...\n";

try {
    $unreadCount = Notification::forUser($manager->id)->unread()->count();
    echo "✓ Scope unread fonctionne: {$unreadCount} notifications non lues\n";
    
    $highPriorityCount = Notification::forUser($manager->id)->withPriority('high')->count();
    echo "✓ Scope priority fonctionne: {$highPriorityCount} notifications haute priorité\n";
    
} catch (Exception $e) {
    echo "✗ Erreur scopes: " . $e->getMessage() . "\n";
}

echo "\n=== TEST TERMINÉ ===\n";
echo "Admin: {$admin->email} (password)\n";
echo "Manager: {$manager->email} (password)\n";
echo "Terrain: {$terrain->nom}\n";
echo "Notification: {$notification->id}\n";
