<?php

require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;
use Illuminate\Database\Schema\Blueprint;

// Configuration de la base de données
$capsule = new DB;
$capsule->addConnection([
    'driver'    => 'pgsql',
    'host'      => 'localhost',
    'database'  => 'terrains_synthetiques',
    'username'  => 'postgres',
    'password'  => 'postgres',
    'charset'   => 'utf8',
    'prefix'    => '',
    'schema'    => 'public',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "=== FUSION DONNEES KML + SEEDER TERRAINS ===\n\n";

// Données du seeder (complètes avec prix, capacité, descriptions)
$seeder_data = [
    'Complexe Be Sport' => [
        'description' => 'Type: Football, Surface: gazon synthétique. Idéal pour les matchs amicaux et les entraînements.',
        'adresse' => 'Route de l\'Aéroport, près de l\'ancien aéroport, Dakar',
        'prix_par_heure' => 18000,
        'capacite' => 22,
    ],
    'Fara Foot' => [
        'description' => 'Un terrain moderne pour le football à 5. Ambiance conviviale garantie.',
        'adresse' => 'Sacré-Cœur, Dakar',
        'prix_par_heure' => 15000,
        'capacite' => 10,
    ],
    'Fit Park Academy' => [
        'description' => 'Complexe multisports avec un terrain de foot de qualité supérieure.',
        'adresse' => 'Mermoz, Dakar',
        'prix_par_heure' => 20000,
        'capacite' => 22,
    ],
    'Skate Parc' => [
        'description' => 'Terrain polyvalent, idéal pour le street football.',
        'adresse' => 'Corniche Ouest, Dakar',
        'prix_par_heure' => 12000,
        'capacite' => 14,
    ],
    'Sowfoot' => [
        'description' => 'Terrain de quartier bien entretenu, parfait pour les passionnés.',
        'adresse' => 'Grand Yoff, Dakar',
        'prix_par_heure' => 14000,
        'capacite' => 18,
    ],
    'Stade Deggo' => [
        'description' => 'Grand terrain avec des installations complètes pour des matchs officiels.',
        'adresse' => 'Marriste, Dakar',
        'prix_par_heure' => 25000,
        'capacite' => 22,
    ],
    'Terrain ASC Jaraaf' => [
        'description' => 'Terrain historique du club ASC Jaraaf, pelouse synthétique de qualité.',
        'adresse' => 'Médina, Dakar',
        'prix_par_heure' => 16000,
        'capacite' => 22,
    ],
    'Stade LSS' => [
        'description' => 'Terrain moderne de Linguère Sporting Saint-Louis, aux normes FIFA.',
        'adresse' => 'Guédiawaye',
        'prix_par_heure' => 22000,
        'capacite' => 22,
    ],
    'Complexe Sportif Parcelles' => [
        'description' => 'Complexe sportif moderne avec plusieurs terrains de qualité.',
        'adresse' => 'Parcelles Assainies',
        'prix_par_heure' => 19000,
        'capacite' => 18,
    ],
    'TENNIS Mini Foot Squash' => [
        'description' => 'Complexe multisports avec terrain de mini-foot, tennis et squash.',
        'adresse' => 'HLM Grand Yoff',
        'prix_par_heure' => 30000,
        'capacite' => 16,
    ],
];

try {
    // Récupérer tous les terrains de la table terrains (avec géométries KML)
    $terrains_kml = DB::table('terrains')->get();
    
    echo "Terrains KML trouvés : " . count($terrains_kml) . "\n";
    echo "Données seeder disponibles : " . count($seeder_data) . "\n\n";
    
    $updated_count = 0;
    $matched_count = 0;
    
    foreach ($terrains_kml as $terrain) {
        $terrain_nom = $terrain->nom;
        
        // Chercher une correspondance exacte dans les données du seeder
        if (isset($seeder_data[$terrain_nom])) {
            $seeder_info = $seeder_data[$terrain_nom];
            $matched_count++;
            
            // Vérifier si mise à jour nécessaire
            $needs_update = false;
            $update_data = [];
            
            // Description
            if (empty($terrain->description) && !empty($seeder_info['description'])) {
                $update_data['description'] = $seeder_info['description'];
                $needs_update = true;
            }
            
            // Adresse
            if (empty($terrain->adresse) && !empty($seeder_info['adresse'])) {
                $update_data['adresse'] = $seeder_info['adresse'];
                $needs_update = true;
            }
            
            // Prix
            if ((empty($terrain->prix_par_heure) || $terrain->prix_par_heure == 0) && !empty($seeder_info['prix_par_heure'])) {
                $update_data['prix_par_heure'] = $seeder_info['prix_par_heure'];
                $needs_update = true;
            }
            
            // Capacité
            if ((empty($terrain->capacite) || $terrain->capacite == 0) && !empty($seeder_info['capacite'])) {
                $update_data['capacite'] = $seeder_info['capacite'];
                $needs_update = true;
            }
            
            if ($needs_update) {
                DB::table('terrains')
                    ->where('id', $terrain->id)
                    ->update($update_data);
                
                $updated_count++;
                
                echo "✅ {$terrain_nom}:\n";
                foreach ($update_data as $field => $value) {
                    if ($field === 'prix_par_heure') {
                        echo "   Prix/heure: " . number_format($value) . " FCFA\n";
                    } elseif ($field === 'capacite') {
                        echo "   Capacité: {$value} joueurs\n";
                    } elseif ($field === 'description') {
                        echo "   Description: " . substr($value, 0, 50) . "...\n";
                    } elseif ($field === 'adresse') {
                        echo "   Adresse: {$value}\n";
                    }
                }
                echo "\n";
            } else {
                echo "⚡ {$terrain_nom}: Déjà complet\n";
            }
        } else {
            echo "⚠️  {$terrain_nom}: Pas de correspondance dans le seeder\n";
        }
    }
    
    echo "\n=== RÉSUMÉ FUSION ===\n";
    echo "Terrains correspondant au seeder: $matched_count/" . count($terrains_kml) . "\n";
    echo "Terrains mis à jour: $updated_count\n";
    
    // Vérification finale
    echo "\n=== VÉRIFICATION FINALE ===\n";
    $terrains_final = DB::table('terrains')->get();
    
    $complete_count = 0;
    $with_geometry_count = 0;
    
    foreach ($terrains_final as $terrain) {
        $has_geometry = !empty($terrain->geometrie_geojson) || !empty($terrain->geometrie);
        $has_price = !empty($terrain->prix_par_heure) && $terrain->prix_par_heure > 0;
        $has_capacity = !empty($terrain->capacite) && $terrain->capacite > 0;
        $has_description = !empty($terrain->description);
        
        if ($has_geometry) $with_geometry_count++;
        if ($has_geometry && $has_price && $has_capacity && $has_description) $complete_count++;
    }
    
    echo "Terrains avec géométrie PostGIS: $with_geometry_count/" . count($terrains_final) . "\n";
    echo "Terrains 100% complets: $complete_count/" . count($terrains_final) . "\n";
    
    if ($complete_count == count($terrains_final)) {
        echo "🎉 PARFAIT : Tous les terrains sont maintenant 100% complets !\n";
        echo "   ✅ Géométries PostGIS (KML)\n";
        echo "   ✅ Prix et capacités (Seeder)\n";
        echo "   ✅ Descriptions et adresses\n";
    } else {
        echo "📊 Progression: $complete_count/" . count($terrains_final) . " terrains complets\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur : " . $e->getMessage() . "\n";
}

echo "\n=== FUSION TERMINÉE ===\n"; 