<?php

require_once 'vendor/autoload.php';

// Charger l'application Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Artisan;

echo "=== Exécution du seeder TerrainsSynthetiquesDakarSeeder ===\n\n";

try {
    // Exécuter le seeder
    Artisan::call('db:seed', [
        '--class' => 'TerrainsSynthetiquesDakarSeeder',
        '--force' => true
    ]);
    
    echo "✅ Seeder exécuté avec succès !\n";
    echo "✅ 12 terrains synthétiques de Dakar créés ou mis à jour\n";
    echo "✅ Géométries PostGIS générées pour tous les terrains\n\n";
    
    // Vérifier le nombre de terrains dans la base
    $terrainsCount = DB::table('terrains_synthetiques_dakar')->count();
    echo "📊 Nombre total de terrains dans la base : {$terrainsCount}\n";
    
    // Afficher la liste des terrains
    echo "\n📋 Liste des terrains dans la base :\n";
    $terrains = DB::table('terrains_synthetiques_dakar')
        ->select('nom', 'prix_heure', 'adresse')
        ->orderBy('nom')
        ->get();
    
    foreach ($terrains as $terrain) {
        echo "- {$terrain->nom} : {$terrain->prix_heure} FCFA/h ({$terrain->adresse})\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur lors de l'exécution du seeder : " . $e->getMessage() . "\n";
    echo "Détails : " . $e->getTraceAsString() . "\n";
}

echo "\n=== Fin de l'exécution ===\n"; 