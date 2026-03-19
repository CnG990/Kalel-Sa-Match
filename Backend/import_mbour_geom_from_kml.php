<?php

/**
 * Script pour importer les géométries des terrains de Mbour depuis les fichiers KML
 * dans la colonne geom_polygon de PostGIS
 * Usage: php import_mbour_geom_from_kml.php
 */

require __DIR__ . '/vendor/autoload.php';

use App\Models\TerrainSynthetiquesDakar;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

// Initialiser Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🗺️  Import des géométries des terrains de Mbour depuis les fichiers KML\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$kmlDir = __DIR__ . '/../kml';

// Mapping des fichiers KML vers les noms de terrains
$kmlMapping = [
    'Foot7+.kml' => 'Foot7+',
    'Mini-Foot Auchan.kml' => 'Mini-Foot Auchan',
    'Rara Complexe.kml' => 'Rara Complexe',
    'rara complexe.kml' => 'Rara Complexe',
    'Rara.kml' => 'Rara Complexe',
    'rara.kml' => 'Rara Complexe',
];

/**
 * Fonction pour convertir un fichier KML en géométrie PostGIS
 */
function kmlToPostGIS($kmlFilePath) {
    try {
        if (!file_exists($kmlFilePath)) {
            return null;
        }

        $kmlContent = File::get($kmlFilePath);
        
        // Échapper les apostrophes pour PostgreSQL
        $kmlEscaped = str_replace("'", "''", $kmlContent);
        
        // Utiliser PostGIS pour parser le KML directement
        // PostGIS peut lire les KML avec ST_GeomFromKML
        try {
            // Méthode 1: Utiliser ST_GeomFromKML (si disponible dans votre version PostGIS)
            $result = DB::selectOne("
                SELECT 
                    ST_Force2D(ST_GeomFromKML(?)) as geometry,
                    ST_GeometryType(ST_Force2D(ST_GeomFromKML(?))) as geom_type,
                    ST_IsValid(ST_Force2D(ST_GeomFromKML(?))) as is_valid
            ", [$kmlContent, $kmlContent, $kmlContent]);
            
            if ($result && $result->geometry && $result->is_valid) {
                return [
                    'geometry' => $result->geometry,
                    'type' => $result->geom_type,
                    'valid' => true
                ];
            }
        } catch (\Exception $e) {
            echo "   ⚠️  ST_GeomFromKML non disponible, tentative avec parsing XML...\n";
        }
        
        // Méthode 2: Parser le KML manuellement et créer le polygone
        $xml = simplexml_load_string($kmlContent);
        if (!$xml) {
            return null;
        }
        
        // Rechercher les coordonnées dans le KML
        $coordinates = [];
        
        // Essayer plusieurs chemins possibles dans le KML
        $paths = [
            '//kml:Polygon//kml:coordinates',
            '//Polygon//coordinates',
            '//kml:Placemark//kml:Polygon//kml:outerBoundaryIs//kml:LinearRing//kml:coordinates',
            '//Placemark//Polygon//outerBoundaryIs//LinearRing//coordinates',
        ];
        
        foreach ($paths as $path) {
            $coords = $xml->xpath($path);
            if (!empty($coords)) {
                $coordsString = (string) $coords[0];
                $coordsArray = explode(' ', trim($coordsString));
                
                foreach ($coordsArray as $coord) {
                    $parts = explode(',', trim($coord));
                    if (count($parts) >= 2) {
                        $longitude = (float) $parts[0];
                        $latitude = (float) $parts[1];
                        $coordinates[] = "$longitude $latitude";
                    }
                }
                
                if (!empty($coordinates)) {
                    break;
                }
            }
        }
        
        if (empty($coordinates)) {
            return null;
        }
        
        // Fermer le polygone si nécessaire
        if ($coordinates[0] !== $coordinates[count($coordinates) - 1]) {
            $coordinates[] = $coordinates[0];
        }
        
        // Créer le WKT POLYGON
        $wkt = 'POLYGON((' . implode(',', $coordinates) . '))';
        
        // Créer la géométrie PostGIS
        $result = DB::selectOne("
            SELECT 
                ST_SetSRID(ST_GeomFromText(?), 4326) as geometry,
                ST_GeometryType(ST_SetSRID(ST_GeomFromText(?), 4326)) as geom_type,
                ST_IsValid(ST_SetSRID(ST_GeomFromText(?), 4326)) as is_valid
        ", [$wkt, $wkt, $wkt]);
        
        if ($result && $result->geometry && $result->is_valid) {
            return [
                'geometry' => $result->geometry,
                'type' => $result->geom_type,
                'valid' => true,
                'wkt' => $wkt
            ];
        }
        
        return null;
    } catch (\Exception $e) {
        echo "   ❌ Erreur lors du parsing KML: " . $e->getMessage() . "\n";
        return null;
    }
}

$updatedCount = 0;
$skippedCount = 0;

foreach ($kmlMapping as $kmlFile => $terrainName) {
    $kmlPath = $kmlDir . '/' . $kmlFile;
    
    echo "📄 Traitement: $kmlFile → $terrainName\n";
    
    if (!file_exists($kmlPath)) {
        echo "   ⚠️  Fichier non trouvé: $kmlPath\n\n";
        $skippedCount++;
        continue;
    }
    
    // Trouver le terrain dans la base de données
    $terrain = TerrainSynthetiquesDakar::where('nom', $terrainName)->first();
    
    if (!$terrain) {
        echo "   ❌ Terrain '$terrainName' non trouvé dans la base de données\n\n";
        $skippedCount++;
        continue;
    }
    
    echo "   ✅ Terrain trouvé (ID: {$terrain->id})\n";
    
    // Convertir le KML en géométrie PostGIS
    $geometryData = kmlToPostGIS($kmlPath);
    
    if (!$geometryData || !$geometryData['valid']) {
        echo "   ❌ Impossible de convertir le KML en géométrie valide\n\n";
        $skippedCount++;
        continue;
    }
    
    echo "   ✅ Géométrie extraite (Type: {$geometryData['type']})\n";
    
    // Mettre à jour la colonne geom_polygon
    try {
        // Utiliser ST_GeomFromText avec le WKT si disponible, sinon utiliser la géométrie directe
        if (isset($geometryData['wkt'])) {
            DB::statement("
                UPDATE terrains_synthetiques_dakar 
                SET geom_polygon = ST_SetSRID(ST_GeomFromText(?), 4326)
                WHERE id = ?
            ", [$geometryData['wkt'], $terrain->id]);
        } else {
            // Utiliser la géométrie déjà créée
            DB::statement("
                UPDATE terrains_synthetiques_dakar 
                SET geom_polygon = ?
                WHERE id = ?
            ", [$geometryData['geometry'], $terrain->id]);
        }
        
        // Mettre à jour aussi le point geom (centroïde du polygone)
        DB::statement("
            UPDATE terrains_synthetiques_dakar 
            SET geom = ST_Centroid(geom_polygon)
            WHERE id = ? AND geom_polygon IS NOT NULL
        ", [$terrain->id]);
        
        // Calculer la surface depuis le polygone
        $surface = DB::selectOne("
            SELECT ROUND(ST_Area(ST_Transform(geom_polygon, 32628))::numeric, 2) as surface_m2
            FROM terrains_synthetiques_dakar 
            WHERE id = ?
        ", [$terrain->id]);
        
        if ($surface && $surface->surface_m2 > 0) {
            // Vérifier quelles colonnes existent
            $columns = DB::select("SELECT column_name FROM information_schema.columns WHERE table_name = 'terrains_synthetiques_dakar'");
            $columnNames = array_map(function($col) { return $col->column_name; }, $columns);
            
            // Construire la requête UPDATE dynamiquement
            $updates = ['surface = ?'];
            $values = [$surface->surface_m2];
            
            if (in_array('surface_postgis', $columnNames)) {
                $updates[] = 'surface_postgis = ?';
                $values[] = $surface->surface_m2;
            }
            
            if (in_array('surface_calculee', $columnNames)) {
                $updates[] = 'surface_calculee = ?';
                $values[] = $surface->surface_m2;
            }
            
            if (in_array('has_geometry', $columnNames)) {
                $updates[] = 'has_geometry = true';
            }
            
            $values[] = $terrain->id;
            
            $sql = "UPDATE terrains_synthetiques_dakar SET " . implode(', ', $updates) . " WHERE id = ?";
            DB::statement($sql, $values);
            
            echo "   ✅ Géométrie insérée (Surface: {$surface->surface_m2} m²)\n";
        } else {
            echo "   ⚠️  Géométrie insérée mais surface non calculée\n";
        }
        
        $updatedCount++;
        
    } catch (\Exception $e) {
        echo "   ❌ Erreur lors de l'insertion: " . $e->getMessage() . "\n";
        $skippedCount++;
    }
    
    echo "\n";
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "✅ Import terminé !\n";
echo "   - Terrains mis à jour: $updatedCount\n";
echo "   - Terrains ignorés: $skippedCount\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

