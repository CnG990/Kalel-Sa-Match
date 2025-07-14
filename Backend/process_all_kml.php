<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\TerrainSynthetiquesDakar;

echo "=== TRAITEMENT AUTOMATIQUE DE TOUS LES KML ===\n\n";

// Dossier contenant les fichiers KML
$kmlDirectory = __DIR__ . '/../kml/';

if (!is_dir($kmlDirectory)) {
    die("❌ Dossier KML non trouvé : $kmlDirectory\n");
}

// Mapping des noms de fichiers vers les noms en base
$nameMapping = [
    'TENNIS Mini Foot Squash.kml' => 'Complexe HLM',
    'Fit Park Academy.kml' => 'Fit Park Academy', 
    'Terrain Diaraf.kml' => 'Terrain ASC Jaraaf',
    'Skate Parc.kml' => 'Skate Parc',
    'fara foot.kml' => 'Fara Foot',
    'Stade Deggo.kml' => 'Stade Deggo',
    'Terrain ASC Liberté 6.kml' => 'Terrain Ouakam',
    'TEMPLE DU FOOT DAKAR  Foot & Padel  Sport Bar.kml' => 'Complexe Be Sport',
    'Stade Demba Diop.kml' => 'Stade LSS',
    'Complexe Be Sport.kml' => 'Complexe Sportif Parcelles',
    'Sowfoot.kml' => 'Sowfoot',
    'Terrain mini foot Premier Projets Aréna.kml' => 'Stade de Pikine',
    'Stade Iba Mar Diop.kml' => 'Terrain Yoff',
];

/**
 * Fonction pour traiter un fichier KML
 */
function processKMLFile($filePath, $terrainNom) {
    try {
        // Lire le contenu du fichier
        $kmlContent = file_get_contents($filePath);
        
        if (!$kmlContent) {
            throw new Exception("Impossible de lire le fichier");
        }
        
        // Parser le KML
        $xml = simplexml_load_string($kmlContent);
        
        if (!$xml) {
            throw new Exception("Impossible de parser le KML");
        }
        
        // Extraire les coordonnées du polygone
        $coordinates = null;
        
        // Recherche dans la structure KML standard
        if (isset($xml->Document->Placemark->Polygon->outerBoundaryIs->LinearRing->coordinates)) {
            $coordinates = (string) $xml->Document->Placemark->Polygon->outerBoundaryIs->LinearRing->coordinates;
        } elseif (isset($xml->Placemark->Polygon->outerBoundaryIs->LinearRing->coordinates)) {
            $coordinates = (string) $xml->Placemark->Polygon->outerBoundaryIs->LinearRing->coordinates;
        }
        
        if (!$coordinates) {
            throw new Exception("Coordonnées non trouvées dans le KML");
        }
        
        // Nettoyer et convertir les coordonnées
        $coordsArray = [];
        $points = explode(' ', trim($coordinates));
        
        foreach ($points as $point) {
            $point = trim($point);
            if (empty($point)) continue;
            
            $coords = explode(',', $point);
            if (count($coords) >= 2) {
                $lng = floatval($coords[0]);
                $lat = floatval($coords[1]);
                $coordsArray[] = [$lng, $lat];
            }
        }
        
        if (count($coordsArray) < 3) {
            throw new Exception("Pas assez de points pour former un polygone");
        }
        
        // Créer le GeoJSON
        $geojson = [
            'type' => 'Polygon',
            'coordinates' => [$coordsArray]
        ];
        
        // Trouver le terrain en base
        $terrain = TerrainSynthetiquesDakar::where('nom', 'LIKE', "%{$terrainNom}%")->first();
        
        if (!$terrain) {
            // Essayer une recherche plus flexible
            $words = explode(' ', $terrainNom);
            $terrain = TerrainSynthetiquesDakar::where(function($query) use ($words) {
                foreach ($words as $word) {
                    if (strlen($word) > 2) {
                        $query->orWhere('nom', 'LIKE', "%{$word}%");
                    }
                }
            })->first();
        }
        
        if (!$terrain) {
            throw new Exception("Terrain '{$terrainNom}' non trouvé en base");
        }
        
        // Convertir GeoJSON en WKT pour PostGIS
        $wkt = convertGeoJSONToWKT($geojson);
        
        // Mettre à jour le terrain avec la géométrie
        DB::statement("
            UPDATE terrains_synthetiques_dakar 
            SET geom = ST_GeomFromText(?, 4326) 
            WHERE id = ?
        ", [$wkt, $terrain->id]);
        
        // Calculer la surface
        $surface = DB::selectOne("
            SELECT ST_Area(ST_Transform(geom, 32628)) as surface 
            FROM terrains_synthetiques_dakar 
            WHERE id = ?
        ", [$terrain->id]);
        
        echo "✅ {$terrain->nom} (ID: {$terrain->id}):\n";
        echo "   📐 Surface: " . number_format($surface->surface, 2) . " m²\n";
        echo "   🗺️  Points: " . count($coordsArray) . "\n";
        echo "   📂 Fichier: " . basename($filePath) . "\n\n";
        
        return [
            'success' => true,
            'terrain' => $terrain->nom,
            'surface' => $surface->surface,
            'points' => count($coordsArray)
        ];
        
    } catch (Exception $e) {
        echo "❌ Erreur pour '{$terrainNom}': " . $e->getMessage() . "\n";
        echo "   📂 Fichier: " . basename($filePath) . "\n\n";
        return [
            'success' => false,
            'terrain' => $terrainNom,
            'error' => $e->getMessage()
        ];
    }
}

/**
 * Convertir GeoJSON en WKT
 */
function convertGeoJSONToWKT($geojson) {
    if ($geojson['type'] === 'Polygon') {
        $coordinates = $geojson['coordinates'][0];
        $points = [];
        foreach ($coordinates as $coord) {
            $points[] = $coord[0] . ' ' . $coord[1];
        }
        return 'POLYGON((' . implode(',', $points) . '))';
    }
    throw new Exception("Type de géométrie non supporté");
}

// =========================================================================
// TRAITEMENT DE TOUS LES FICHIERS KML
// =========================================================================

$results = [];
$totalFiles = 0;
$successCount = 0;
$totalSurface = 0;

echo "🔄 Recherche des fichiers KML dans : $kmlDirectory\n\n";

foreach ($nameMapping as $fileName => $terrainName) {
    $filePath = $kmlDirectory . $fileName;
    
    if (file_exists($filePath)) {
        $totalFiles++;
        echo "📁 Traitement de : $fileName → $terrainName\n";
        
        $result = processKMLFile($filePath, $terrainName);
        $results[] = $result;
        
        if ($result['success']) {
            $successCount++;
            $totalSurface += $result['surface'];
        }
    } else {
        echo "⚠️  Fichier non trouvé : $fileName\n\n";
    }
}

// =========================================================================
// RAPPORT FINAL
// =========================================================================

echo "\n" . str_repeat("=", 60) . "\n";
echo "🏆 RAPPORT FINAL - IMPORT KML GOOGLE EARTH\n";
echo str_repeat("=", 60) . "\n\n";

echo "📊 STATISTIQUES :\n";
echo "   • Fichiers traités : $successCount/$totalFiles\n";
echo "   • Surface totale : " . number_format($totalSurface, 2) . " m²\n";
echo "   • Surface moyenne : " . number_format($totalSurface / max($successCount, 1), 2) . " m²\n\n";

if ($successCount > 0) {
    echo "✅ TERRAINS AVEC GÉOMÉTRIE POSTGIS :\n";
    foreach ($results as $result) {
        if ($result['success']) {
            echo "   🏟️  {$result['terrain']} - " . number_format($result['surface'], 0) . " m²\n";
        }
    }
}

if ($successCount < $totalFiles) {
    echo "\n❌ ERREURS RENCONTRÉES :\n";
    foreach ($results as $result) {
        if (!$result['success']) {
            echo "   ⚠️  {$result['terrain']} : {$result['error']}\n";
        }
    }
}

echo "\n🎯 PROCHAINES ÉTAPES :\n";
echo "   1. Vérifiez l'interface admin pour voir les nouvelles surfaces\n";
echo "   2. Testez l'affichage sur la carte\n";
echo "   3. Les surfaces PostGIS sont maintenant prioritaires\n\n";

echo "🚀 Import KML terminé avec succès !\n"; 