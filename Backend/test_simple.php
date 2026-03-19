<?php
/**
 * Test Simple - Vérification des fonctionnalités de base
 */

require_once __DIR__ . '/vendor/autoload.php';

// Initialiser l'application Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Terrain;
use App\Models\Notification;

echo "=== TEST SIMPLE DES FONCTIONNALITÉS ===\n\n";

try {
    // 1. Test de la base de données
    echo "1. Test de la base de données...\n";
    
    $userCount = DB::table('users')->count();
    echo "✓ Table users: {$userCount} enregistrements\n";
    
    $terrainCount = DB::table('terrains_synthetiques_dakar')->count();
    echo "✓ Table terrains: {$terrainCount} enregistrements\n";
    
    $notificationCount = DB::table('notifications')->count();
    echo "✓ Table notifications: {$notificationCount} enregistrements\n";
    
    // 2. Test de création d'utilisateur
    echo "\n2. Test de création d'utilisateur...\n";
    
    $user = User::create([
        'nom' => 'Test',
        'prenom' => 'User',
        'email' => 'test@example.com',
        'mot_de_passe' => bcrypt('password'),
        'role' => 'client',
        'telephone' => '123456789',
        'adresse' => 'Adresse Test'
    ]);
    
    echo "✓ Utilisateur créé: {$user->email} (ID: {$user->id})\n";
    
    // 3. Test de la relation notifications
    echo "\n3. Test de la relation notifications...\n";
    
    $notifications = $user->notifications;
    echo "✓ Relation notifications: " . $notifications->count() . " notifications\n";
    
    // 4. Nettoyage
    echo "\n4. Nettoyage...\n";
    $user->delete();
    echo "✓ Utilisateur de test supprimé\n";
    
    echo "\n=== TEST TERMINÉ AVEC SUCCÈS ===\n";
    
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
    echo "Fichier: " . $e->getFile() . "\n";
    echo "Ligne: " . $e->getLine() . "\n";
}
