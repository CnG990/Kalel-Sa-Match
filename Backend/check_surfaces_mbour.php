<?php

/**
 * Script pour vérifier les surfaces des terrains de Mbour
 * Usage: php check_surfaces_mbour.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\TerrainSynthetiquesDakar;
use Illuminate\Support\Facades\DB;

echo "📊 Vérification des surfaces des terrains de Mbour\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$mbourTerrains = [
    'Foot7+',
    'Mini-Foot Auchan',
    'Rara Complexe',
];

foreach ($mbourTerrains as $nom) {
    $terrain = TerrainSynthetiquesDakar::where('nom', $nom)->first();
    
    if ($terrain) {
        echo "✅ {$nom} (ID: {$terrain->id}):\n";
        
        // Vérifier la colonne surface
        echo "   - Colonne 'surface': " . ($terrain->surface ?? 'NULL') . " m²\n";
        
        // Calculer la surface depuis geom_polygon si disponible
        $surfaceFromPolygon = DB::selectOne("
            SELECT 
                ROUND(ST_Area(ST_Transform(geom_polygon, 32628))::numeric, 2) as surface_m2
            FROM terrains_synthetiques_dakar
            WHERE id = ? AND geom_polygon IS NOT NULL
        ", [$terrain->id]);
        
        if ($surfaceFromPolygon && $surfaceFromPolygon->surface_m2 > 0) {
            echo "   - Surface depuis geom_polygon: {$surfaceFromPolygon->surface_m2} m²\n";
            
            // Mettre à jour la colonne surface si elle est différente
            if ($terrain->surface != $surfaceFromPolygon->surface_m2) {
                $terrain->surface = $surfaceFromPolygon->surface_m2;
                $terrain->save();
                echo "   ✅ Surface mise à jour dans la base de données\n";
            }
        } else {
            echo "   ⚠️  Aucune géométrie polygon disponible\n";
        }
        
        echo "\n";
    } else {
        echo "❌ {$nom}: NON TROUVÉ\n\n";
    }
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "✅ Vérification terminée !\n";

