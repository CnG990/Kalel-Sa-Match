<?php

require_once 'vendor/autoload.php';

use App\Models\TerrainSynthetiquesDakar;
use Illuminate\Support\Facades\DB;

// Initialiser Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== INFORMATIONS DE CONTACT DES TERRAINS SYNTHETIQUES ===\n\n";

// Recuperer tous les terrains avec leurs informations de contact
$terrains = TerrainSynthetiquesDakar::select([
    'nom',
    'adresse',
    'contact_telephone',
    'email_contact',
    'prix_heure',
    'horaires_ouverture',
    'horaires_fermeture'
])->orderBy('nom')->get();

echo "NUMEROS DE TELEPHONE DES TERRAINS SYNTHETIQUES DAKAR\n";
echo "========================================================\n\n";

foreach ($terrains as $terrain) {
    echo "TERRAIN: " . strtoupper($terrain->nom) . "\n";
    echo "   Adresse: " . ($terrain->adresse ?? 'Non specifiee') . "\n";
    echo "   Telephone: " . ($terrain->contact_telephone ?? 'Non specifie') . "\n";
    echo "   Email: " . ($terrain->email_contact ?? 'Non specifie') . "\n";
    echo "   Prix/heure: " . number_format($terrain->prix_heure ?? 0, 0, ',', ' ') . " FCFA\n";
    echo "   Horaires: " . ($terrain->horaires_ouverture ?? '08:00') . " - " . ($terrain->horaires_fermeture ?? '23:00') . "\n";
    echo "\n";
}

echo "\nRESUME DES CONTACTS:\n";
echo "=======================\n";
echo "Total des terrains: " . $terrains->count() . "\n";
echo "Terrains avec telephone: " . $terrains->whereNotNull('contact_telephone')->count() . "\n";
echo "Terrains avec email: " . $terrains->whereNotNull('email_contact')->count() . "\n";

// Recherche des numeros manquants
$terrainsSansTelephone = $terrains->whereNull('contact_telephone');
if ($terrainsSansTelephone->count() > 0) {
    echo "\nTERRAINS SANS NUMERO DE TELEPHONE:\n";
    echo "=====================================\n";
    foreach ($terrainsSansTelephone as $terrain) {
        echo "   - " . $terrain->nom . "\n";
    }
}

echo "\nExtraction terminee!\n"; 