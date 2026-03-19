<?php

/**
 * Script pour vérifier la colonne geom des terrains
 * Usage: php check_geom_column.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\TerrainSynthetiquesDakar;
use Illuminate\Support\Facades\DB;

echo "🔍 Vérification de la colonne geom des terrains\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Vérifier si la colonne geom existe
$columns = DB::select("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'terrains_synthetiques_dakar' AND column_name = 'geom'");

if (empty($columns)) {
    echo "❌ La colonne 'geom' n'existe pas dans la table 'terrains_synthetiques_dakar'\n";
    echo "💡 Il faut peut-être créer cette colonne avec PostGIS\n\n";
} else {
    echo "✅ La colonne 'geom' existe (Type: {$columns[0]->data_type})\n\n";
}

// Vérifier les terrains de Mbour
$mbourTerrains = [
    'Foot7+',
    'Mini-Foot Auchan',
    'Rara Complexe',
];

echo "📊 Vérification des terrains de Mbour:\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

foreach ($mbourTerrains as $nom) {
    $terrain = TerrainSynthetiquesDakar::where('nom', $nom)->first();
    
    if ($terrain) {
        echo "✅ {$nom} (ID: {$terrain->id}):\n";
        
        // Vérifier si geom existe dans le modèle
        if (isset($terrain->geom)) {
            echo "   - Colonne geom présente dans le modèle\n";
        } else {
            echo "   - Colonne geom non accessible via le modèle\n";
        }
        
        // Vérifier directement dans la base de données
        $geomData = DB::selectOne("SELECT ST_AsText(geom) as geom_text, ST_AsGeoJSON(geom) as geom_json FROM terrains_synthetiques_dakar WHERE id = ?", [$terrain->id]);
        
        if ($geomData && $geomData->geom_text) {
            echo "   - ✅ Géométrie présente: {$geomData->geom_text}\n";
            echo "   - GeoJSON: " . substr($geomData->geom_json, 0, 100) . "...\n";
        } else {
            echo "   - ❌ Aucune géométrie dans la colonne geom\n";
        }
        
        echo "\n";
    } else {
        echo "❌ {$nom}: NON TROUVÉ\n\n";
    }
}

// Compter les terrains avec géométrie
$withGeom = DB::selectOne("SELECT COUNT(*) as count FROM terrains_synthetiques_dakar WHERE geom IS NOT NULL");
$total = DB::selectOne("SELECT COUNT(*) as count FROM terrains_synthetiques_dakar");

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "📊 Statistiques:\n";
echo "   - Total terrains: {$total->count}\n";
echo "   - Terrains avec géométrie: {$withGeom->count}\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

