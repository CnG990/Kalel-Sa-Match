<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

// Charger la configuration Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Test de connexion à la base de données...\n";

try {
    // Test de connexion
    $pdo = DB::connection()->getPdo();
    echo "✅ Connexion à la base de données réussie!\n";
    echo "📊 Base de données: " . DB::connection()->getDatabaseName() . "\n";
    
    // Test de requête simple
    $users = DB::table('users')->count();
    echo "👥 Nombre d'utilisateurs dans la base: " . $users . "\n";
    
    // Afficher quelques utilisateurs
    $sampleUsers = DB::table('users')->select('email', 'role')->limit(5)->get();
    echo "📋 Utilisateurs disponibles:\n";
    foreach ($sampleUsers as $user) {
        echo "   - " . $user->email . " (Rôle: " . $user->role . ")\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur de connexion: " . $e->getMessage() . "\n";
    echo "🔧 Vérifiez votre configuration de base de données dans le fichier .env\n";
}




