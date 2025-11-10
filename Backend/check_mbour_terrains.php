<?php

/**
 * Script pour vérifier les terrains de Mbour dans la base de données
 * Usage: php check_mbour_terrains.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\TerrainSynthetiquesDakar;

echo "🔍 Vérification des terrains de Mbour\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$mbourTerrains = [
    'Foot7+',
    'Mini-Foot Auchan',
    'Rara Complexe',
];

foreach ($mbourTerrains as $nom) {
    $terrain = TerrainSynthetiquesDakar::where('nom', $nom)->first();
    
    if ($terrain) {
        echo "✅ {$nom}:\n";
        echo "   - ID: {$terrain->id}\n";
        echo "   - Latitude: {$terrain->latitude}\n";
        echo "   - Longitude: {$terrain->longitude}\n";
        echo "   - Prix/heure: {$terrain->prix_heure} FCFA\n";
        echo "   - Capacité: {$terrain->capacite} joueurs\n";
        echo "   - Actif: " . ($terrain->est_actif ? 'Oui' : 'Non') . "\n";
        
        // Vérifier si les coordonnées sont valides
        if ($terrain->latitude == 0 || $terrain->longitude == 0 || 
            $terrain->latitude == null || $terrain->longitude == null) {
            echo "   ⚠️  ATTENTION: Coordonnées invalides (0 ou null)!\n";
        } else {
            echo "   ✅ Coordonnées valides\n";
        }
        echo "\n";
    } else {
        echo "❌ {$nom}: NON TROUVÉ dans la base de données\n\n";
    }
}

// Compter le total de terrains actifs
$totalActifs = TerrainSynthetiquesDakar::where('est_actif', true)->count();
$totalAvecCoordonnees = TerrainSynthetiquesDakar::where('est_actif', true)
    ->whereNotNull('latitude')
    ->whereNotNull('longitude')
    ->where('latitude', '!=', 0)
    ->where('longitude', '!=', 0)
    ->count();

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "📊 Statistiques:\n";
echo "   - Total terrains actifs: {$totalActifs}\n";
echo "   - Terrains avec coordonnées valides: {$totalAvecCoordonnees}\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

