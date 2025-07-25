<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Database\Seeders\TerrainsSynthetiquesDakarSeeder;

// Configuration de la base de données
$capsule = new Capsule;
$capsule->addConnection([
    'driver' => 'pgsql',
    'host' => 'localhost',
    'database' => 'terrains_db',
    'username' => 'postgres',
    'password' => 'fatah',
    'charset' => 'utf8',
    'prefix' => '',
    'schema' => 'public',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "🔄 Mise à jour des terrains avec les prix réels...\n";

try {
    // Exécuter le seeder
    $seeder = new TerrainsSynthetiquesDakarSeeder();
    $seeder->run();
    
    echo "✅ Seeder exécuté avec succès !\n";
    
    // Vérifier les prix mis à jour
    echo "\n📊 Vérification des prix mis à jour :\n";
    echo "=" . str_repeat("=", 70) . "\n";
    
    $terrains = Capsule::table('terrains_synthetiques_dakar')
        ->select(['nom', 'prix_heure', 'adresse'])
        ->orderBy('prix_heure', 'desc')
        ->get();
    
    foreach ($terrains as $terrain) {
        $prix_formatte = number_format($terrain->prix_heure, 0, ',', ' ');
        echo sprintf("%-25s | %12s FCFA | %-30s\n", 
            substr($terrain->nom, 0, 24),
            $prix_formatte,
            substr($terrain->adresse, 0, 29)
        );
    }
    
    echo "=" . str_repeat("=", 70) . "\n";
    echo "📋 Total terrains : " . $terrains->count() . "\n";
    echo "💰 Prix le plus élevé : " . number_format($terrains->max('prix_heure'), 0, ',', ' ') . " FCFA\n";
    echo "💰 Prix le plus bas : " . number_format($terrains->min('prix_heure'), 0, ',', ' ') . " FCFA\n";
    echo "💰 Prix moyen : " . number_format($terrains->avg('prix_heure'), 0, ',', ' ') . " FCFA\n";
    
    echo "\n🎯 Tous les terrains ont été mis à jour avec les prix réels !\n";
    echo "💡 Les prix varient maintenant de façon réaliste selon chaque terrain.\n";
    
} catch (Exception $e) {
    echo "❌ Erreur lors de l'exécution du seeder : " . $e->getMessage() . "\n";
    echo "Stack trace : " . $e->getTraceAsString() . "\n";
    exit(1);
} 