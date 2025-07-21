<?php

require_once 'vendor/autoload.php';

// Charger l'application Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Vérification des terrains dans la base de données ===\n\n";

// Liste des 12 terrains principaux du mémoire
$terrainsPrincipaux = [
    'Complexe Be Sport',
    'Fara Foot',
    'Fit Park Academy',
    'Skate Parc',
    'Sowfoot',
    'Stade Deggo',
    'Terrain ASC Jaraaf',
    'TENNIS Mini Foot Squash',
    'Temple du Foot',
    'Terrain École Police',
    'Terrain Sacré Cœur',
    'Terrain Thia'
];

// Récupérer tous les terrains de la base
$terrainsBase = DB::table('terrains_synthetiques_dakar')
    ->select('nom', 'prix_heure', 'adresse', 'capacite')
    ->orderBy('nom')
    ->get();

echo "📊 Nombre total de terrains dans la base : " . $terrainsBase->count() . "\n\n";

echo "📋 Liste complète des terrains dans la base :\n";
foreach ($terrainsBase as $terrain) {
    $status = in_array($terrain->nom, $terrainsPrincipaux) ? "✅" : "❌";
    echo "{$status} {$terrain->nom} : {$terrain->prix_heure} FCFA/h ({$terrain->adresse})\n";
}

echo "\n=== Analyse ===\n";

// Terrains principaux présents dans la base
$terrainsPresents = [];
foreach ($terrainsPrincipaux as $terrain) {
    $existe = $terrainsBase->where('nom', $terrain)->first();
    if ($existe) {
        $terrainsPresents[] = $terrain;
    }
}

echo "✅ Terrains principaux présents dans la base (" . count($terrainsPresents) . "/12) :\n";
foreach ($terrainsPresents as $terrain) {
    echo "- {$terrain}\n";
}

// Terrains principaux manquants
$terrainsManquants = array_diff($terrainsPrincipaux, $terrainsPresents);
if (!empty($terrainsManquants)) {
    echo "\n❌ Terrains principaux manquants dans la base :\n";
    foreach ($terrainsManquants as $terrain) {
        echo "- {$terrain}\n";
    }
}

// Terrains supplémentaires dans la base
$terrainsSupplementaires = [];
foreach ($terrainsBase as $terrain) {
    if (!in_array($terrain->nom, $terrainsPrincipaux)) {
        $terrainsSupplementaires[] = $terrain->nom;
    }
}

if (!empty($terrainsSupplementaires)) {
    echo "\n📝 Terrains supplémentaires dans la base (non dans la liste principale) :\n";
    foreach ($terrainsSupplementaires as $terrain) {
        echo "- {$terrain}\n";
    }
}

echo "\n=== Recommandations ===\n";
if (count($terrainsPresents) === 12) {
    echo "✅ Parfait ! Tous les 12 terrains principaux sont dans la base.\n";
} else {
    echo "⚠️  Il manque " . (12 - count($terrainsPresents)) . " terrains principaux dans la base.\n";
    echo "   Exécutez le seeder pour les ajouter.\n";
}

if (!empty($terrainsSupplementaires)) {
    echo "ℹ️  Il y a " . count($terrainsSupplementaires) . " terrains supplémentaires dans la base.\n";
    echo "   Ces terrains ne sont pas dans la liste principale du mémoire.\n";
}

echo "\n=== Fin de la vérification ===\n"; 