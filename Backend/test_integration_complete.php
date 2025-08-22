<?php
/**
 * Test d'Intégration Complète - Backend + Frontend
 * Ce script teste la communication complète entre le backend et le frontend
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Terrain;
use App\Models\Notification;
use App\Http\Controllers\API\NotificationController;

echo "=== TEST D'INTÉGRATION COMPLÈTE BACKEND + FRONTEND ===\n\n";

try {
    // 1. Test de connectivité de base
    echo "1. Test de connectivité de base...\n";
    
    // Test de la base de données
    $dbTest = DB::connection()->getPdo();
    echo "✓ Connexion base de données: OK\n";
    
    // Test des tables principales
    $tables = ['users', 'terrains_synthetiques_dakar', 'notifications'];
    foreach ($tables as $table) {
        $count = DB::table($table)->count();
        echo "✓ Table {$table}: {$count} enregistrements\n";
    }
    
    // 2. Test de l'API de santé
    echo "\n2. Test de l'API de santé...\n";
    
    // Simulation d'un appel HTTP à l'API de santé
    $response = app()->handle(
        \Illuminate\Http\Request::create('/api/health', 'GET')
    );
    
    if ($response->getStatusCode() === 200) {
        $data = json_decode($response->getContent(), true);
        echo "✓ API de santé: {$data['status']} - {$data['message']}\n";
    } else {
        echo "✗ API de santé: Erreur {$response->getStatusCode()}\n";
    }
    
    // 3. Test de création de données de test
    echo "\n3. Création de données de test...\n";
    
    // Nettoyage des données existantes
    DB::statement('TRUNCATE TABLE users, terrains_synthetiques_dakar, notifications RESTART IDENTITY CASCADE');
    
    // Création d'un admin
    $admin = User::create([
        'nom' => 'Admin',
        'prenom' => 'Test',
        'email' => 'admin@test.com',
        'mot_de_passe' => bcrypt('password'),
        'role' => 'admin',
        'telephone' => '123456789',
        'adresse' => 'Adresse Test'
    ]);
    echo "✓ Admin créé: {$admin->email}\n";
    
    // Création d'un gestionnaire
    $manager = User::create([
        'nom' => 'Manager',
        'prenom' => 'Test',
        'email' => 'manager@test.com',
        'mot_de_passe' => bcrypt('password'),
        'role' => 'gestionnaire',
        'telephone' => '987654321',
        'adresse' => 'Adresse Manager'
    ]);
    echo "✓ Manager créé: {$manager->email}\n";
    
    // Création d'un terrain
    $terrain = Terrain::create([
        'nom' => 'Terrain Test Intégration',
        'description' => 'Terrain pour test d\'intégration',
        'adresse' => 'Adresse Terrain',
        'latitude' => 14.7167,
        'longitude' => -17.4677,
        'type_surface' => 'pelouse_naturelle',
        'est_actif' => true,
        'source_creation' => 'manuel',
        'gestionnaire_id' => $manager->id
    ]);
    echo "✓ Terrain créé: {$terrain->nom}\n";
    
    // 4. Test des notifications avec authentification
    echo "\n4. Test des notifications avec authentification...\n";
    
    // Authentification du manager
    Auth::login($manager);
    echo "✓ Manager authentifié: " . Auth::user()->email . "\n";
    
    // Test de création de notification
    $notification = Notification::create([
        'id' => Str::uuid(),
        'type' => 'App\Notifications\TerrainAssigned',
        'notifiable_type' => User::class,
        'notifiable_id' => $manager->id,
        'data' => json_encode([
            'terrain_id' => $terrain->id,
            'terrain_nom' => $terrain->nom,
            'admin_nom' => $admin->nom . ' ' . $admin->prenom,
            'message' => "Un terrain vous a été assigné par {$admin->nom} {$admin->prenom}"
        ]),
        'read_at' => null,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "✓ Notification créée: ID {$notification->id}\n";
    
    // 5. Test des endpoints API avec authentification
    echo "\n5. Test des endpoints API avec authentification...\n";
    
    // Test GET /api/notifications
    $request = \Illuminate\Http\Request::create('/api/notifications', 'GET');
    $request->setUserResolver(function () use ($manager) {
        return $manager;
    });
    
    $controller = app(NotificationController::class);
    $response = $controller->index($request);
    
    if ($response->getStatusCode() === 200) {
        $data = json_decode($response->getContent(), true);
        $count = count($data['data']);
        $unreadCount = $data['unread_count'];
        echo "✓ GET /api/notifications: {$count} notifications, {$unreadCount} non lues\n";
    } else {
        echo "✗ GET /api/notifications: Erreur {$response->getStatusCode()}\n";
    }
    
    // Test GET /api/notifications/unread-count
    $request = \Illuminate\Http\Request::create('/api/notifications/unread-count', 'GET');
    $request->setUserResolver(function () use ($manager) {
        return $manager;
    });
    
    $response = $controller->unreadCount($request);
    
    if ($response->getStatusCode() === 200) {
        $data = json_decode($response->getContent(), true);
        $count = $data['unread_count'];
        echo "✓ GET /api/notifications/unread-count: {$count} notifications non lues\n";
    } else {
        echo "✗ GET /api/notifications/unread-count: Erreur {$response->getStatusCode()}\n";
    }
    
    // Test POST /api/notifications/{id}/read
    $request = \Illuminate\Http\Request::create("/api/notifications/{$notification->id}/read", 'POST');
    $request->setUserResolver(function () use ($manager) {
        return $manager;
    });
    
    $response = $controller->markAsRead($request, $notification->id);
    
    if ($response->getStatusCode() === 200) {
        $data = json_decode($response->getContent(), true);
        echo "✓ POST /api/notifications/{id}/read: {$data['message']}\n";
    } else {
        echo "✗ POST /api/notifications/{id}/read: Erreur {$response->getStatusCode()}\n";
    }
    
    // Vérification que la notification est marquée comme lue
    $notification->refresh();
    if ($notification->read_at) {
        echo "✓ Notification marquée comme lue: " . $notification->read_at . "\n";
    } else {
        echo "✗ Notification non marquée comme lue\n";
    }
    
    // 6. Test de la relation User->notifications
    echo "\n6. Test de la relation User->notifications...\n";
    
    $userNotifications = $manager->notifications;
    $count = $userNotifications->count();
    echo "✓ Relation notifications: {$count} notifications trouvées\n";
    
    if ($count > 0) {
        $firstNotification = $userNotifications->first();
        $data = json_decode($firstNotification->data, true);
        echo "✓ Données de notification: Terrain {$data['terrain_nom']} assigné par {$data['admin_nom']}\n";
    }
    
    // 7. Test de simulation frontend
    echo "\n7. Test de simulation frontend...\n";
    
    // Simulation d'un appel depuis le frontend
    $frontendRequest = \Illuminate\Http\Request::create('/api/notifications', 'GET', [], [], [], [
        'HTTP_ACCEPT' => 'application/json',
        'HTTP_CONTENT_TYPE' => 'application/json',
        'HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    ]);
    $frontendRequest->setUserResolver(function () use ($manager) {
        return $manager;
    });
    
    $response = $controller->index($frontendRequest);
    
    if ($response->getStatusCode() === 200) {
        $data = json_decode($response->getContent(), true);
        echo "✓ Simulation frontend: Réponse API valide\n";
        echo "  - Status: {$response->getStatusCode()}\n";
        echo "  - Content-Type: {$response->headers->get('Content-Type')}\n";
        echo "  - Notifications: " . count($data['data']) . "\n";
    } else {
        echo "✗ Simulation frontend: Erreur {$response->getStatusCode()}\n";
    }
    
    echo "\n=== TEST D'INTÉGRATION COMPLÈTE TERMINÉ ===\n";
    echo "Admin: {$admin->email} (password)\n";
    echo "Manager: {$manager->email} (password)\n";
    echo "Terrain: {$terrain->nom}\n";
    echo "Notification: {$notification->id}\n";
    
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
    echo "Fichier: " . $e->getFile() . "\n";
    echo "Ligne: " . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
