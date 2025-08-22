<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\TerrainSynthetiquesDakar;

echo "=== DIAGNOSTIC COMPLET DES PROBLÈMES ===\n\n";

// 1. Vérifier les terrains et leurs données
echo "1. ANALYSE DES TERRAINS:\n";
$terrains = TerrainSynthetiquesDakar::all();

foreach ($terrains as $terrain) {
    echo "\n🏟️  {$terrain->nom} (ID: {$terrain->id}):\n";
    
    // Vérifier les colonnes géométriques
    $hasGeom = !empty($terrain->geom);
    $hasGeomPolygon = !empty($terrain->geom_polygon);
    
    echo "   - geom (POINT): " . ($hasGeom ? "✅ Présent" : "❌ Absent") . "\n";
    echo "   - geom_polygon (POLYGON): " . ($hasGeomPolygon ? "✅ Présent" : "❌ Absent") . "\n";
    
    if ($hasGeom) {
        $geomType = DB::select("SELECT ST_GeometryType(geom) as type FROM terrains_synthetiques_dakar WHERE id = ?", [$terrain->id]);
        echo "   - Type geom: " . ($geomType[0]->type ?? 'Inconnu') . "\n";
    }
    
    if ($hasGeomPolygon) {
        $polygonType = DB::select("SELECT ST_GeometryType(geom_polygon) as type FROM terrains_synthetiques_dakar WHERE id = ?", [$terrain->id]);
        echo "   - Type geom_polygon: " . ($polygonType[0]->type ?? 'Inconnu') . "\n";
    }
    
    // Vérifier les surfaces
    echo "   - surface (manuelle): " . ($terrain->surface ? $terrain->surface . " m²" : "❌ Absente") . "\n";
    echo "   - surface_postgis: " . ($terrain->surface_postgis ? $terrain->surface_postgis . " m²" : "❌ Absente") . "\n";
    echo "   - surface_calculee: " . ($terrain->surface_calculee ? $terrain->surface_calculee . " m²" : "❌ Absente") . "\n";
    
    // Vérifier les prix
    echo "   - prix_heure: " . $terrain->prix_heure . " FCFA/h\n";
    echo "   - capacite: " . $terrain->capacite . "\n";
}

echo "\n\n2. VÉRIFICATION DES CALCULS POSTGIS:\n";

// Tester les calculs PostGIS directement
$terrainsWithPolygon = DB::table('terrains_synthetiques_dakar')
    ->whereNotNull('geom_polygon')
    ->get();

echo "   - Terrains avec geom_polygon: " . $terrainsWithPolygon->count() . "\n";

foreach ($terrainsWithPolygon as $terrain) {
    echo "\n   🏟️  {$terrain->nom}:\n";
    
    // Calculer la surface directement
    $surface = DB::select("
        SELECT 
            ST_Area(ST_Transform(geom_polygon, 32628)) as surface_m2,
            ST_GeometryType(geom_polygon) as geom_type,
            ST_IsValid(geom_polygon) as is_valid,
            ST_SRID(geom_polygon) as srid
        FROM terrains_synthetiques_dakar 
        WHERE id = ?
    ", [$terrain->id]);
    
    if (!empty($surface)) {
        $result = $surface[0];
        echo "     - Surface calculée: " . round($result->surface_m2, 2) . " m²\n";
        echo "     - Type géométrie: " . $result->geom_type . "\n";
        echo "     - Géométrie valide: " . ($result->is_valid ? "✅ Oui" : "❌ Non") . "\n";
        echo "     - SRID: " . $result->srid . "\n";
    }
}

echo "\n\n3. VÉRIFICATION DES PRIX VARIABLES:\n";
$prixVariables = DB::table('prix_terrains')->count();
echo "   - Prix variables en base: {$prixVariables}\n";

if ($prixVariables > 0) {
    $prixParTerrain = DB::table('prix_terrains')
        ->join('terrains_synthetiques_dakar', 'prix_terrains.terrain_id', '=', 'terrains_synthetiques_dakar.id')
        ->select(['terrains_synthetiques_dakar.nom', DB::raw('COUNT(prix_terrains.id) as nb_prix')])
        ->groupBy('terrains_synthetiques_dakar.id', 'terrains_synthetiques_dakar.nom')
        ->get();
    
    foreach ($prixParTerrain as $prix) {
        echo "     - {$prix->nom}: {$prix->nb_prix} prix variables\n";
    }
}

echo "\n\n4. PROBLÈMES IDENTIFIÉS:\n";

// Problème 1: Colonnes manquantes
$missingColumns = [];
$requiredColumns = ['surface_postgis', 'surface_calculee', 'has_geometry'];
$columns = DB::select("SELECT column_name FROM information_schema.columns WHERE table_name = 'terrains_synthetiques_dakar'");
$existingColumns = array_column($columns, 'column_name');

foreach ($requiredColumns as $col) {
    if (!in_array($col, $existingColumns)) {
        $missingColumns[] = $col;
    }
}

if (!empty($missingColumns)) {
    echo "   ❌ Colonnes manquantes: " . implode(', ', $missingColumns) . "\n";
} else {
    echo "   ✅ Toutes les colonnes requises sont présentes\n";
}

// Problème 2: Données manquantes
$terrainsSansSurface = TerrainSynthetiquesDakar::whereNull('surface_postgis')->count();
$terrainsSansGeometrie = TerrainSynthetiquesDakar::whereNull('geom_polygon')->count();

echo "   - Terrains sans surface PostGIS: {$terrainsSansSurface}\n";
echo "   - Terrains sans géométrie polygon: {$terrainsSansGeometrie}\n";

echo "\n\n5. RECOMMANDATIONS:\n";
echo "   1. Ajouter les colonnes manquantes si nécessaire\n";
echo "   2. Recalculer les surfaces PostGIS\n";
echo "   3. Mettre à jour has_geometry\n";
echo "   4. Vérifier les prix variables\n";
echo "   5. Tester l'API admin\n";

echo "\n=== FIN DU DIAGNOSTIC ===\n";





