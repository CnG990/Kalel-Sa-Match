<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== VÉRIFICATION DES PRIX VARIABLES ===\n\n";

// Afficher tous les prix variables actuels
echo "📊 Prix variables actuels dans la base de données:\n\n";

$prixVariables = DB::table('prix_terrains')
    ->join('terrains_synthetiques_dakar', 'prix_terrains.terrain_id', '=', 'terrains_synthetiques_dakar.id')
    ->select('terrains_synthetiques_dakar.nom', 'prix_terrains.*')
    ->orderBy('terrains_synthetiques_dakar.nom')
    ->orderBy('prix_terrains.prix')
    ->get();

foreach ($prixVariables as $prix) {
    echo "🏟️  {$prix->nom}:\n";
    echo "   - Taille: {$prix->taille}\n";
    echo "   - Terrain spécifique: {$prix->nom_terrain_specifique}\n";
    echo "   - Période: {$prix->periode}\n";
    echo "   - Jour: {$prix->jour_semaine}\n";
    echo "   - Prix: {$prix->prix} FCFA\n";
    echo "   - Durée: {$prix->duree}\n";
    echo "   - Heures: {$prix->heure_debut} - {$prix->heure_fin}\n";
    echo "\n";
}

echo "\n🔍 Prix avec décimales suspectes:\n";
$prixSuspects = $prixVariables->filter(function($prix) {
    return $prix->prix != round($prix->prix) || $prix->prix % 1000 != 0;
});

foreach ($prixSuspects as $prix) {
    echo "❌ {$prix->nom} - {$prix->taille}: {$prix->prix} FCFA (suspect)\n";
}

echo "\n";
