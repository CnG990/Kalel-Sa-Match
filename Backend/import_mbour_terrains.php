<?php

/**
 * Script pour importer les terrains de Mbour depuis les fichiers KML
 * Usage: php import_mbour_terrains.php
 */

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use App\Models\TerrainSynthetiquesDakar;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

/**
 * Calculer le centre d'un polygon à partir des coordonnées KML
 */
function calculatePolygonCenter($coordinatesString) {
    // Parser les coordonnées: "lon1,lat1,0 lon2,lat2,0 ..."
    $coords = explode(' ', trim($coordinatesString));
    $points = [];
    
    foreach ($coords as $coord) {
        if (empty(trim($coord))) continue;
        $parts = explode(',', trim($coord));
        if (count($parts) >= 2) {
            $points[] = [
                'lon' => (float) $parts[0],
                'lat' => (float) $parts[1]
            ];
        }
    }
    
    if (empty($points)) {
        return ['lat' => 0, 'lon' => 0];
    }
    
    // Calculer le centre (moyenne des coordonnées)
    $sumLat = 0;
    $sumLon = 0;
    $count = count($points);
    
    foreach ($points as $point) {
        $sumLat += $point['lat'];
        $sumLon += $point['lon'];
    }
    
    return [
        'lat' => $sumLat / $count,
        'lon' => $sumLon / $count
    ];
}

/**
 * Parser un fichier KML et extraire les informations
 */
function parseKML($filePath) {
    if (!file_exists($filePath)) {
        return null;
    }
    
    $content = file_get_contents($filePath);
    $xml = simplexml_load_string($content);
    
    if (!$xml || !isset($xml->Document->Placemark)) {
        return null;
    }
    
    $placemark = $xml->Document->Placemark;
    $name = (string) $placemark->name;
    
    // Extraire les coordonnées du polygon
    $coordinates = '';
    if (isset($placemark->Polygon->outerBoundaryIs->LinearRing->coordinates)) {
        $coordinates = (string) $placemark->Polygon->outerBoundaryIs->LinearRing->coordinates;
    }
    
    $center = calculatePolygonCenter($coordinates);
    
    return [
        'nom' => $name,
        'latitude' => $center['lat'],
        'longitude' => $center['lon'],
        'coordinates' => $coordinates
    ];
}

echo "🗺️  Import des terrains de Mbour depuis les fichiers KML\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$kmlDir = __DIR__ . '/../kml';
$terrains = [];

// 1. Foot7+
$foot7Path = $kmlDir . '/Foot7+.kml';
if (file_exists($foot7Path)) {
    $data = parseKML($foot7Path);
    if ($data) {
        $terrains[] = [
            'nom' => 'Foot7+',
            'description' => 'Foot7+ - Terrain de football synthétique à Mbour. Idéal pour les matchs et entraînements.',
            'adresse' => 'Mbour, Sénégal',
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'prix_heure' => 25000,
            'capacite' => 16, // 8v8
            'surface' => null,
            'gestionnaire_id' => null,
            'contact_telephone' => null,
            'email_contact' => null,
            'horaires_ouverture' => '08:00:00',
            'horaires_fermeture' => '23:00:00',
            'type_surface' => 'synthétique',
            'equipements' => null,
            'regles_maison' => null,
            'note_moyenne' => 0,
            'nombre_avis' => 0,
            'image_principale' => '/terrain-foot.jpg',
            'images_supplementaires' => null,
            'est_actif' => true,
            'jours_disponibles' => json_encode(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']),
            'creneaux_disponibles' => json_encode(['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00']),
            'conditions_abonnement' => null,
            'accepte_paiement_differe' => true,
            'acompte_minimum' => null,
            'duree_engagement_minimum' => 30,
            'reductions_abonnement' => null,
        ];
        echo "✅ Foot7+ parsé: Lat={$data['latitude']}, Lon={$data['longitude']}\n";
    }
} else {
    echo "⚠️  Fichier Foot7+.kml non trouvé\n";
}

// 2. Mini-Foot Auchan
$miniFootPath = $kmlDir . '/Mini-Foot Auchan.kml';
if (file_exists($miniFootPath)) {
    $data = parseKML($miniFootPath);
    if ($data) {
        $terrains[] = [
            'nom' => 'Mini-Foot Auchan',
            'description' => 'Mini-Foot Auchan - Terrain de mini-foot situé à Mbour près du centre commercial Auchan. Parfait pour les matchs rapides.',
            'adresse' => 'Mbour, près d\'Auchan, Sénégal',
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'prix_heure' => 25000,
            'capacite' => 16, // 8v8
            'surface' => null,
            'gestionnaire_id' => null,
            'contact_telephone' => null,
            'email_contact' => null,
            'horaires_ouverture' => '08:00:00',
            'horaires_fermeture' => '23:00:00',
            'type_surface' => 'synthétique',
            'equipements' => null,
            'regles_maison' => null,
            'note_moyenne' => 0,
            'nombre_avis' => 0,
            'image_principale' => '/terrain-foot.jpg',
            'images_supplementaires' => null,
            'est_actif' => true,
            'jours_disponibles' => json_encode(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']),
            'creneaux_disponibles' => json_encode(['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00']),
            'conditions_abonnement' => null,
            'accepte_paiement_differe' => true,
            'acompte_minimum' => null,
            'duree_engagement_minimum' => 30,
            'reductions_abonnement' => null,
        ];
        echo "✅ Mini-Foot Auchan parsé: Lat={$data['latitude']}, Lon={$data['longitude']}\n";
    }
} else {
    echo "⚠️  Fichier Mini-Foot Auchan.kml non trouvé\n";
}

// 3. Rara Complexe (si le fichier KML existe)
$raraFiles = [
    $kmlDir . '/Rara Complexe.kml',
    $kmlDir . '/rara complexe.kml',
    $kmlDir . '/Rara.kml',
    $kmlDir . '/rara.kml',
];

$raraFound = false;
foreach ($raraFiles as $raraPath) {
    if (file_exists($raraPath)) {
        $data = parseKML($raraPath);
        if ($data) {
            $terrains[] = [
                'nom' => 'Rara Complexe',
                'description' => 'Rara Complexe - Complexe sportif à Mbour avec terrain de football synthétique. Installations modernes et bien entretenues.',
                'adresse' => 'Mbour, Sénégal',
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'prix_heure' => 25000,
                'capacite' => 22, // Terrain standard
                'surface' => null,
                'gestionnaire_id' => null,
                'contact_telephone' => null,
                'email_contact' => null,
                'horaires_ouverture' => '08:00:00',
                'horaires_fermeture' => '23:00:00',
                'type_surface' => 'synthétique',
                'equipements' => null,
                'regles_maison' => null,
                'note_moyenne' => 0,
                'nombre_avis' => 0,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
                'jours_disponibles' => json_encode(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']),
                'creneaux_disponibles' => json_encode(['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00']),
                'conditions_abonnement' => null,
                'accepte_paiement_differe' => true,
                'acompte_minimum' => null,
                'duree_engagement_minimum' => 30,
                'reductions_abonnement' => null,
            ];
            echo "✅ Rara Complexe parsé: Lat={$data['latitude']}, Lon={$data['longitude']}\n";
            $raraFound = true;
            break;
        }
    }
}

if (!$raraFound) {
    echo "⚠️  Fichier KML pour Rara Complexe non trouvé. Utilisation de coordonnées par défaut.\n";
    $terrains[] = [
        'nom' => 'Rara Complexe',
        'description' => 'Rara Complexe - Complexe sportif à Mbour avec terrain de football synthétique. Installations modernes et bien entretenues.',
        'adresse' => 'Mbour, Sénégal',
        'latitude' => 14.4300, // Coordonnées approximatives Mbour
        'longitude' => -16.9700,
        'prix_heure' => 25000,
        'capacite' => 22,
        'surface' => null,
        'gestionnaire_id' => null,
        'contact_telephone' => null,
        'email_contact' => null,
        'horaires_ouverture' => '08:00:00',
        'horaires_fermeture' => '23:00:00',
        'type_surface' => 'synthétique',
        'equipements' => null,
        'regles_maison' => null,
        'note_moyenne' => 0,
        'nombre_avis' => 0,
        'image_principale' => '/terrain-foot.jpg',
        'images_supplementaires' => null,
        'est_actif' => true,
        'jours_disponibles' => json_encode(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']),
        'creneaux_disponibles' => json_encode(['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00']),
        'conditions_abonnement' => null,
        'accepte_paiement_differe' => true,
        'acompte_minimum' => null,
        'duree_engagement_minimum' => 30,
        'reductions_abonnement' => null,
    ];
}

echo "\n📊 Import dans la base de données...\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

$imported = 0;
$skipped = 0;

foreach ($terrains as $terrain) {
    // Vérifier si le terrain existe déjà
    $existing = TerrainSynthetiquesDakar::where('nom', $terrain['nom'])
        ->where('adresse', 'like', '%Mbour%')
        ->first();

    if (!$existing) {
        TerrainSynthetiquesDakar::create($terrain);
        echo "✅ Terrain créé: {$terrain['nom']} (Lat: {$terrain['latitude']}, Lon: {$terrain['longitude']})\n";
        $imported++;
    } else {
        echo "⚠️  Terrain déjà existant: {$terrain['nom']}\n";
        $skipped++;
    }
}

echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "✅ Import terminé !\n";
echo "   - Terrains créés: $imported\n";
echo "   - Terrains ignorés (déjà existants): $skipped\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

