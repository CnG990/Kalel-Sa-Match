<?php

/**
 * Script pour mettre à jour les terrains de Mbour
 * Usage: php update_mbour_terrains.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\TerrainSynthetiquesDakar;

echo "🔄 Mise à jour des terrains de Mbour\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// 1. Mettre à jour Mini-Foot Auchan
$miniFoot = TerrainSynthetiquesDakar::where('nom', 'Mini-Foot Auchan')->first();
if ($miniFoot) {
    $miniFoot->prix_heure = 25000;
    $miniFoot->capacite = 16;
    $miniFoot->save();
    echo "✅ Mini-Foot Auchan mis à jour:\n";
    echo "   - Prix/heure: 25,000 FCFA\n";
    echo "   - Capacité: 16 joueurs (8v8)\n\n";
} else {
    echo "⚠️  Mini-Foot Auchan non trouvé dans la base de données\n\n";
}

// 2. Vérifier Rara Complexe
$rara = TerrainSynthetiquesDakar::where('nom', 'Rara Complexe')->first();
if ($rara) {
    echo "✅ Rara Complexe trouvé dans la base de données:\n";
    echo "   - Latitude: {$rara->latitude}\n";
    echo "   - Longitude: {$rara->longitude}\n";
    echo "   - Prix/heure: {$rara->prix_heure} FCFA\n";
    echo "   - Capacité: {$rara->capacite} joueurs\n\n";
} else {
    echo "⚠️  Rara Complexe non trouvé dans la base de données\n\n";
}

// 3. Vérifier les fichiers KML dans le dossier kml
$kmlDir = __DIR__ . '/../kml';
echo "🔍 Recherche du fichier KML pour Rara Complexe...\n";
echo "   Dossier: $kmlDir\n\n";

$raraFiles = [
    'Rara Complexe.kml',
    'rara complexe.kml',
    'Rara.kml',
    'rara.kml',
    'Rara Complexe.kml',
    'RARA COMPLEXE.kml',
];

$found = false;
foreach ($raraFiles as $fileName) {
    $filePath = $kmlDir . '/' . $fileName;
    if (file_exists($filePath)) {
        echo "✅ Fichier trouvé: $fileName\n";
        echo "   Chemin: $filePath\n";
        
        // Lire le contenu du fichier
        $content = file_get_contents($filePath);
        $xml = simplexml_load_string($content);
        
        if ($xml && isset($xml->Document->Placemark)) {
            $placemark = $xml->Document->Placemark;
            $name = (string) $placemark->name;
            echo "   Nom dans le KML: $name\n";
            
            // Vérifier les coordonnées
            if (isset($placemark->Polygon->outerBoundaryIs->LinearRing->coordinates)) {
                $coordinates = (string) $placemark->Polygon->outerBoundaryIs->LinearRing->coordinates;
                echo "   ✅ Coordonnées trouvées dans le polygon\n";
                
                // Calculer le centre
                $coords = explode(' ', trim($coordinates));
                $points = [];
                foreach ($coords as $coord) {
                    if (empty(trim($coord))) continue;
                    $parts = explode(',', trim($coord));
                    if (count($parts) >= 2) {
                        $points[] = ['lat' => (float)$parts[1], 'lon' => (float)$parts[0]];
                    }
                }
                
                if (!empty($points)) {
                    $sumLat = 0;
                    $sumLon = 0;
                    foreach ($points as $point) {
                        $sumLat += $point['lat'];
                        $sumLon += $point['lon'];
                    }
                    $centerLat = $sumLat / count($points);
                    $centerLon = $sumLon / count($points);
                    
                    echo "   Centre calculé: Lat=$centerLat, Lon=$centerLon\n";
                    
                    // Mettre à jour Rara Complexe avec les vraies coordonnées
                    if ($rara) {
                        $rara->latitude = $centerLat;
                        $rara->longitude = $centerLon;
                        $rara->save();
                        echo "   ✅ Coordonnées mises à jour dans la base de données\n";
                    }
                }
            } else {
                echo "   ⚠️  Aucune coordonnée trouvée dans le polygon\n";
            }
        } else {
            echo "   ⚠️  Structure KML invalide ou Placemark non trouvé\n";
        }
        
        $found = true;
        break;
    }
}

if (!$found) {
    echo "❌ Aucun fichier KML trouvé pour Rara Complexe\n";
    echo "   Fichiers recherchés:\n";
    foreach ($raraFiles as $fileName) {
        echo "   - $fileName\n";
    }
    echo "\n💡 Solution:\n";
    echo "   1. Vérifiez que le fichier KML existe dans le dossier 'kml'\n";
    echo "   2. Vérifiez le nom exact du fichier (sensible à la casse)\n";
    echo "   3. Si le fichier a un nom différent, renommez-le en 'Rara Complexe.kml'\n";
}

echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "✅ Mise à jour terminée !\n";

