<?php

require_once 'vendor/autoload.php';

use App\Models\TerrainSynthetiquesDakar;

// Initialiser Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VÉRIFICATION STADE DEGGO ===\n\n";

$terrain = TerrainSynthetiquesDakar::where('nom', 'LIKE', '%Stade Deggo%')->first();

if ($terrain) {
    echo "Nom: " . $terrain->nom . "\n";
    echo "Adresse actuelle: " . $terrain->adresse . "\n";
    echo "Latitude: " . $terrain->latitude . "\n";
    echo "Longitude: " . $terrain->longitude . "\n";
    echo "Prix/heure: " . $terrain->prix_heure . " FCFA\n";
    echo "Capacité: " . $terrain->capacite . " joueurs\n";
} else {
    echo "Stade Deggo non trouvé dans la base de données.\n";
}

echo "\n=== FIN ===\n"; 