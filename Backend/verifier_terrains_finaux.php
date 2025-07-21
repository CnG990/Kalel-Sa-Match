<?php

require_once 'vendor/autoload.php';

use App\Models\TerrainSynthetiquesDakar;

// Initialiser Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VÉRIFICATION TERRAINS FINAUX ===\n\n";

$terrains = TerrainSynthetiquesDakar::all(['nom', 'adresse', 'prix_heure', 'capacite']);

echo "Nombre total de terrains : " . count($terrains) . "\n\n";

echo "Liste des terrains :\n";
echo "===================\n";

foreach ($terrains as $terrain) {
    echo "- " . $terrain->nom . "\n";
    echo "  Adresse : " . $terrain->adresse . "\n";
    echo "  Prix : " . $terrain->prix_heure . " FCFA/h\n";
    echo "  Capacité : " . $terrain->capacite . " joueurs\n";
    echo "\n";
}

echo "=== FIN ===\n"; 