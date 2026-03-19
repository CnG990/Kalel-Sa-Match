<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== RÉPARATION SIMPLE DES TERRAINS ===\n\n";

// 1. Ajouter les colonnes manquantes
echo "1. Ajout des colonnes manquantes...\n";
try {
    DB::statement("ALTER TABLE terrains_synthetiques_dakar ADD COLUMN IF NOT EXISTS surface_postgis DECIMAL(10,2)");
    DB::statement("ALTER TABLE terrains_synthetiques_dakar ADD COLUMN IF NOT EXISTS surface_calculee DECIMAL(10,2)");
    DB::statement("ALTER TABLE terrains_synthetiques_dakar ADD COLUMN IF NOT EXISTS has_geometry BOOLEAN DEFAULT FALSE");
    echo "✅ Colonnes ajoutées\n";
} catch (Exception $e) {
    echo "⚠️  Colonnes déjà existantes\n";
}

// 2. Créer les points géométriques depuis les coordonnées
echo "\n2. Création des points géométriques...\n";
$terrains = DB::table('terrains_synthetiques_dakar')->get();

foreach ($terrains as $terrain) {
    if ($terrain->latitude && $terrain->longitude) {
        try {
            // Créer le point géométrique
            DB::statement("
                UPDATE terrains_synthetiques_dakar 
                SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326)
                WHERE id = ?
            ", [$terrain->longitude, $terrain->latitude, $terrain->id]);
            
            echo "✅ {$terrain->nom}: Point créé\n";
        } catch (Exception $e) {
            echo "❌ {$terrain->nom}: Erreur - " . $e->getMessage() . "\n";
        }
    } else {
        echo "⚠️  {$terrain->nom}: Coordonnées manquantes\n";
    }
}

// 3. Créer des polygones simples avec des coordonnées fixes
echo "\n3. Création de polygones simples...\n";
foreach ($terrains as $terrain) {
    if ($terrain->latitude && $terrain->longitude) {
        try {
            // Créer un polygone carré simple autour du point
            $lon = $terrain->longitude;
            $lat = $terrain->latitude;
            $offset = 0.0005; // ~50m en degrés
            
            $polygonWKT = "POLYGON((" . 
                ($lon - $offset) . " " . ($lat - $offset) . "," .
                ($lon + $offset) . " " . ($lat - $offset) . "," .
                ($lon + $offset) . " " . ($lat + $offset) . "," .
                ($lon - $offset) . " " . ($lat + $offset) . "," .
                ($lon - $offset) . " " . ($lat - $offset) . "))";
            
            DB::statement("
                UPDATE terrains_synthetiques_dakar 
                SET geom_polygon = ST_SetSRID(ST_GeomFromText(?), 4326)
                WHERE id = ?
            ", [$polygonWKT, $terrain->id]);
            
            echo "✅ {$terrain->nom}: Polygone créé\n";
        } catch (Exception $e) {
            echo "❌ {$terrain->nom}: Erreur polygone - " . $e->getMessage() . "\n";
        }
    }
}

// 4. Calculer les surfaces
echo "\n4. Calcul des surfaces...\n";
foreach ($terrains as $terrain) {
    try {
        $surface = DB::select("
            SELECT ST_Area(ST_Transform(geom_polygon, 32628)) as surface 
            FROM terrains_synthetiques_dakar 
            WHERE id = ? AND geom_polygon IS NOT NULL
        ", [$terrain->id]);
        
        if (!empty($surface) && $surface[0]->surface > 0) {
            $surfaceM2 = round($surface[0]->surface, 2);
            DB::statement("
                UPDATE terrains_synthetiques_dakar 
                SET surface_postgis = ?, surface_calculee = ?, has_geometry = true 
                WHERE id = ?
            ", [$surfaceM2, $surfaceM2, $terrain->id]);
            echo "✅ {$terrain->nom}: {$surfaceM2} m²\n";
        } else {
            // Surface par défaut
            DB::statement("
                UPDATE terrains_synthetiques_dakar 
                SET surface_postgis = 1000, surface_calculee = 1000, has_geometry = false 
                WHERE id = ?
            ", [$terrain->id]);
            echo "⚠️  {$terrain->nom}: Surface par défaut (1000 m²)\n";
        }
    } catch (Exception $e) {
        echo "❌ {$terrain->nom}: Erreur surface - " . $e->getMessage() . "\n";
    }
}

// 5. Vérification finale
echo "\n5. Vérification finale...\n";
$total = DB::table('terrains_synthetiques_dakar')->count();
$avecGeom = DB::table('terrains_synthetiques_dakar')->whereNotNull('geom')->count();
$avecPolygon = DB::table('terrains_synthetiques_dakar')->whereNotNull('geom_polygon')->count();
$avecSurface = DB::table('terrains_synthetiques_dakar')->whereNotNull('surface_postgis')->count();

echo "   - Total terrains: {$total}\n";
echo "   - Avec point géométrique: {$avecGeom}\n";
echo "   - Avec polygone: {$avecPolygon}\n";
echo "   - Avec surface: {$avecSurface}\n";

echo "\n🎉 RÉPARATION TERMINÉE !\n";
echo "💡 Les terrains devraient maintenant s'afficher correctement dans l'admin.\n";










