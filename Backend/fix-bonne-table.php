<?php
require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🔧 TRANSFERT GPS VERS LA BONNE TABLE\n";
echo "====================================\n\n";

// Coordonnées GPS des 12 terrains KML
$terrains_kml_gps = [
    'Complexe Be Sport' => ['lat' => 14.741226791072, 'lng' => -17.46870422525],
    'Fit Park Academy' => ['lat' => 14.675075735364, 'lng' => -17.463641411292],
    'Skate Parc' => ['lat' => 14.674433910129, 'lng' => -17.453031416317],
    'Sowfoot' => ['lat' => 14.683383919242, 'lng' => -17.441240818532],
    'Stade Deggo' => ['lat' => 14.732297474739, 'lng' => -17.433873889219],
    'Stade Demba Diop' => ['lat' => 14.710950199751, 'lng' => -17.458150498838],
    'Stade Iba Mar Diop' => ['lat' => 14.679345187587, 'lng' => -17.446573178854],
    'Tennis Mini Foot Squash' => ['lat' => 14.687531144254, 'lng' => -17.468018967474],
    'Terrain ASC Liberté 6' => ['lat' => 14.726104275907, 'lng' => -17.462681123977],
    'Terrain Diaraf' => ['lat' => 14.681067995847, 'lng' => -17.452030728363],
    'Terrain Mini Foot Premier Projets Aréna' => ['lat' => 14.66983739547, 'lng' => -17.468738558774],
    'Fara Foot' => ['lat' => 14.69771976436627, 'lng' => -17.47249566199687]
];

echo "🎯 Mise à jour de la BONNE table: terrains_synthetiques_dakar\n\n";

$updated = 0;
$created = 0;

foreach ($terrains_kml_gps as $nom => $coords) {
    echo "🏟️ Traitement: $nom\n";
    
    // Chercher dans la bonne table
    $terrain = DB::table('terrains_synthetiques_dakar')
        ->where('nom', 'ILIKE', '%' . $nom . '%')
        ->first();
        
    if ($terrain) {
        // Mettre à jour GPS dans la bonne table
        $affected = DB::table('terrains_synthetiques_dakar')
            ->where('id', $terrain->id)
            ->update([
                'latitude' => $coords['lat'],
                'longitude' => $coords['lng'],
                'updated_at' => now()
            ]);
            
        if ($affected > 0) {
            echo "   ✅ GPS mis à jour dans terrains_synthetiques_dakar\n";
            echo "      📍 Coordonnées: {$coords['lat']}, {$coords['lng']}\n";
            $updated++;
        }
    } else {
        // Créer nouveau terrain dans la bonne table
        try {
            $id = DB::table('terrains_synthetiques_dakar')->insertGetId([
                'nom' => $nom,
                'latitude' => $coords['lat'],
                'longitude' => $coords['lng'],
                'adresse' => $nom . ', Dakar, Sénégal',
                'prix_par_heure' => 15000,
                'capacite_joueurs' => 22,
                'surface_terrain' => 400,
                'disponible' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            echo "   ✅ Nouveau terrain créé dans terrains_synthetiques_dakar\n";
            echo "      📍 ID: $id - GPS: {$coords['lat']}, {$coords['lng']}\n";
            $created++;
        } catch (Exception $e) {
            echo "   ⚠️ Erreur création: " . $e->getMessage() . "\n";
            echo "      Tentative mise à jour uniquement GPS...\n";
            
            // Essayer de trouver par nom moins strict
            $terrain_flexible = DB::table('terrains_synthetiques_dakar')
                ->where('nom', 'ILIKE', '%' . explode(' ', $nom)[0] . '%')
                ->first();
                
            if ($terrain_flexible) {
                DB::table('terrains_synthetiques_dakar')
                    ->where('id', $terrain_flexible->id)
                    ->update([
                        'latitude' => $coords['lat'],
                        'longitude' => $coords['lng'],
                        'updated_at' => now()
                    ]);
                echo "   ✅ GPS mis à jour (recherche flexible)\n";
                $updated++;
            }
        }
    }
    echo "\n";
}

echo "📊 RÉSULTATS FINAUX:\n";
echo "====================\n";
echo "✅ Terrains mis à jour: $updated\n";
echo "✅ Terrains créés: $created\n";

// Vérification finale
$total_gps = DB::table('terrains_synthetiques_dakar')
    ->whereNotNull('latitude')
    ->whereNotNull('longitude')
    ->where('latitude', '!=', 0)
    ->where('longitude', '!=', 0)
    ->count();

echo "📍 Total terrains avec GPS dans terrains_synthetiques_dakar: $total_gps\n";

// Liste des terrains avec GPS
echo "\n🔍 Terrains avec GPS dans la BONNE table:\n";
$terrains_gps = DB::table('terrains_synthetiques_dakar')
    ->select('id', 'nom', 'latitude', 'longitude')
    ->whereNotNull('latitude')
    ->whereNotNull('longitude')
    ->where('latitude', '!=', 0)
    ->where('longitude', '!=', 0)
    ->get();

foreach ($terrains_gps as $t) {
    echo "   🏟️ ID {$t->id}: {$t->nom} -> {$t->latitude}, {$t->longitude}\n";
}

echo "\n🎉 SUCCESS!\n";
echo "===========\n";
echo "• Table correcte utilisée: terrains_synthetiques_dakar\n";
echo "• Coordonnées GPS des fichiers KML transférées\n";
echo "• La carte va maintenant afficher tous les terrains!\n";
?> 