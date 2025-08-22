<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== RÉPARATION DES TERRAINS ===\n\n";

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

// 2. Créer les géométries depuis les coordonnées
echo "\n2. Création des géométries...\n";
$terrains = DB::table('terrains_synthetiques_dakar')->get();

foreach ($terrains as $terrain) {
    if ($terrain->latitude && $terrain->longitude) {
        // Créer le point
        DB::statement("UPDATE terrains_synthetiques_dakar SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?", 
            [$terrain->longitude, $terrain->latitude, $terrain->id]);
        
        // Créer un polygone simple
        $offset = 0.001;
        $coords = [
            $terrain->longitude - $offset, $terrain->latitude - $offset,
            $terrain->longitude + $offset, $terrain->latitude - $offset,
            $terrain->longitude + $offset, $terrain->latitude + $offset,
            $terrain->longitude - $offset, $terrain->latitude + $offset,
            $terrain->longitude - $offset, $terrain->latitude - $offset
        ];
        
        $polygonWKT = "POLYGON((" . implode(',', $coords) . "))";
        DB::statement("UPDATE terrains_synthetiques_dakar SET geom_polygon = ST_SetSRID(ST_GeomFromText(?), 4326) WHERE id = ?", 
            [$polygonWKT, $terrain->id]);
        
        echo "✅ {$terrain->nom}: Géométries créées\n";
    }
}

// 3. Calculer les surfaces
echo "\n3. Calcul des surfaces...\n";
foreach ($terrains as $terrain) {
    $surface = DB::select("SELECT ST_Area(ST_Transform(geom_polygon, 32628)) as surface FROM terrains_synthetiques_dakar WHERE id = ?", [$terrain->id]);
    
    if (!empty($surface) && $surface[0]->surface > 0) {
        $surfaceM2 = round($surface[0]->surface, 2);
        DB::statement("UPDATE terrains_synthetiques_dakar SET surface_postgis = ?, surface_calculee = ?, has_geometry = true WHERE id = ?", 
            [$surfaceM2, $surfaceM2, $terrain->id]);
        echo "✅ {$terrain->nom}: {$surfaceM2} m²\n";
    } else {
        DB::statement("UPDATE terrains_synthetiques_dakar SET surface_postgis = 1000, surface_calculee = 1000, has_geometry = false WHERE id = ?", [$terrain->id]);
        echo "⚠️  {$terrain->nom}: Surface par défaut\n";
    }
}

echo "\n🎉 RÉPARATION TERMINÉE !\n";
