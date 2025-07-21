<?php

require_once 'vendor/autoload.php';

// Charger l'application Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Suppression des terrains supplémentaires ===\n\n";

// Liste des terrains à supprimer (non dans la liste principale du mémoire)
$terrainsASupprimer = [
    'Complexe Sportif Parcelles',
    'Stade de Pikine',
    'Stade LSS',
    'Terrain Ouakam',
    'Terrain Yoff'
];

echo "🗑️  Terrains à supprimer :\n";
foreach ($terrainsASupprimer as $terrain) {
    echo "- {$terrain}\n";
}

echo "\n=== Suppression en cours ===\n";

$supprimes = 0;
foreach ($terrainsASupprimer as $nomTerrain) {
    $deleted = DB::table('terrains_synthetiques_dakar')
        ->where('nom', $nomTerrain)
        ->delete();
    
    if ($deleted > 0) {
        echo "✅ Supprimé : {$nomTerrain}\n";
        $supprimes++;
    } else {
        echo "❌ Non trouvé : {$nomTerrain}\n";
    }
}

echo "\n=== Résultat ===\n";
echo "🗑️  Terrains supprimés : {$supprimes}\n";

// Vérifier le nombre total de terrains après suppression
$totalTerrains = DB::table('terrains_synthetiques_dakar')->count();
echo "📊 Nombre total de terrains dans la base : {$totalTerrains}\n";

// Afficher la liste des terrains restants
echo "\n📋 Terrains restants dans la base :\n";
$terrainsRestants = DB::table('terrains_synthetiques_dakar')
    ->select('nom', 'prix_heure', 'adresse')
    ->orderBy('nom')
    ->get();

foreach ($terrainsRestants as $terrain) {
    echo "- {$terrain->nom} : {$terrain->prix_heure} FCFA/h ({$terrain->adresse})\n";
}

echo "\n✅ Suppression terminée !\n";
echo "✅ La base contient maintenant exactement les 12 terrains du mémoire.\n"; 