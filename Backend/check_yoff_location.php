<?php

require_once 'vendor/autoload.php';

use App\Models\TerrainSynthetiquesDakar;

// Initialiser Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== GÉOLOCALISATION TERRAIN YOFF ===\n\n";

$terrain = TerrainSynthetiquesDakar::where('nom', 'LIKE', '%Terrain Yoff%')->first();

if ($terrain) {
    echo "Nom: " . $terrain->nom . "\n";
    echo "Latitude: " . $terrain->latitude . "\n";
    echo "Longitude: " . $terrain->longitude . "\n";
    echo "Adresse: " . $terrain->adresse . "\n";
    echo "Prix/heure: " . $terrain->prix_heure . " FCFA\n";
    echo "Capacité: " . $terrain->capacite . " joueurs\n";
} else {
    echo "Terrain Yoff non trouvé dans la base de données.\n";
}

echo "\n=== FIN ===\n"; 