<?php
require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🔍 VERIFICATION TABLES ET DONNEES\n";
echo "==================================\n\n";

// 1. Lister toutes les tables qui contiennent "terrain"
echo "📋 Tables contenant 'terrain':\n";
$tables = DB::select("
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%terrain%'
    ORDER BY table_name
");

foreach ($tables as $table) {
    $count = DB::table($table->table_name)->count();
    echo "   📄 {$table->table_name} -> $count enregistrements\n";
}

echo "\n";

// 2. Vérifier spécifiquement la table terrains_synthetiques_dakar
echo "🏟️ Table 'terrains_synthetiques_dakar':\n";
try {
    $count_tsd = DB::table('terrains_synthetiques_dakar')->count();
    echo "   📊 Total enregistrements: $count_tsd\n";
    
    if ($count_tsd > 0) {
        // Vérifier si elle a des colonnes GPS
        $columns_tsd = DB::select("
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'terrains_synthetiques_dakar' 
            AND column_name IN ('latitude', 'longitude')
        ");
        
        echo "   🗺️ Colonnes GPS: " . count($columns_tsd) . " sur 2\n";
        
        // Lister quelques terrains
        $terrains_tsd = DB::table('terrains_synthetiques_dakar')
            ->select('id', 'nom', 'latitude', 'longitude')
            ->limit(5)
            ->get();
            
        echo "   🔍 Premiers terrains:\n";
        foreach ($terrains_tsd as $t) {
            $gps = ($t->latitude && $t->longitude) ? "GPS: {$t->latitude}, {$t->longitude}" : "Pas de GPS";
            echo "      - ID {$t->id}: {$t->nom} ($gps)\n";
        }
    }
} catch (Exception $e) {
    echo "   ❌ Table 'terrains_synthetiques_dakar' n'existe pas ou erreur: " . $e->getMessage() . "\n";
}

echo "\n";

// 3. Vérifier la table terrains 
echo "🏟️ Table 'terrains':\n";
try {
    $count_t = DB::table('terrains')->count();
    echo "   📊 Total enregistrements: $count_t\n";
    
    // Vérifier colonnes GPS
    $columns_t = DB::select("
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'terrains' 
        AND column_name IN ('latitude', 'longitude')
    ");
    
    echo "   🗺️ Colonnes GPS: " . count($columns_t) . " sur 2\n";
    
    // Terrains avec GPS
    $with_gps = DB::table('terrains')
        ->whereNotNull('latitude')
        ->whereNotNull('longitude')
        ->where('latitude', '!=', 0)
        ->where('longitude', '!=', 0)
        ->count();
        
    echo "   📍 Terrains avec GPS: $with_gps sur $count_t\n";
    
    // Lister tous les terrains avec GPS
    $terrains_gps = DB::table('terrains')
        ->select('id', 'nom', 'latitude', 'longitude')
        ->whereNotNull('latitude')
        ->whereNotNull('longitude')
        ->where('latitude', '!=', 0)
        ->where('longitude', '!=', 0)
        ->get();
        
    echo "   🔍 Terrains avec coordonnées GPS:\n";
    foreach ($terrains_gps as $t) {
        echo "      - ID {$t->id}: {$t->nom} -> {$t->latitude}, {$t->longitude}\n";
    }
    
    // Terrains sans GPS
    echo "\n   ⚠️ Terrains SANS GPS:\n";
    $terrains_sans_gps = DB::table('terrains')
        ->select('id', 'nom')
        ->where(function($query) {
            $query->whereNull('latitude')
                  ->orWhereNull('longitude')
                  ->orWhere('latitude', 0)
                  ->orWhere('longitude', 0);
        })
        ->get();
        
    foreach ($terrains_sans_gps as $t) {
        echo "      - ID {$t->id}: {$t->nom} (MANQUE GPS)\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Erreur table terrains: " . $e->getMessage() . "\n";
}

echo "\n";

// 4. Les 12 terrains KML vs ce qui existe
echo "📄 ANALYSE KML vs BASE:\n";
$terrains_kml = [
    'Complexe Be Sport',
    'Fit Park Academy', 
    'Skate Parc',
    'Sowfoot',
    'Stade Deggo',
    'Stade Demba Diop',
    'Stade Iba Mar Diop',
    'Tennis Mini Foot Squash',
    'Terrain ASC Liberté 6',
    'Terrain Diaraf',
    'Terrain Mini Foot Premier Projets Aréna',
    'Fara Foot'
];

echo "   📊 Terrains extraits des KML: " . count($terrains_kml) . "\n\n";

foreach ($terrains_kml as $nom_kml) {
    // Chercher dans table terrains
    $found_t = DB::table('terrains')->where('nom', 'ILIKE', '%' . $nom_kml . '%')->first();
    
    // Chercher dans table terrains_synthetiques_dakar si elle existe
    $found_tsd = null;
    try {
        $found_tsd = DB::table('terrains_synthetiques_dakar')->where('nom', 'ILIKE', '%' . $nom_kml . '%')->first();
    } catch (Exception $e) {
        // Table n'existe pas
    }
    
    echo "   🏟️ $nom_kml:\n";
    if ($found_t) {
        $gps_status = ($found_t->latitude && $found_t->longitude) ? "✅ GPS OK" : "❌ GPS manquant";
        echo "      - Table 'terrains': ID {$found_t->id} ($gps_status)\n";
    } else {
        echo "      - Table 'terrains': ❌ NON TROUVÉ\n";
    }
    
    if ($found_tsd) {
        $gps_status = ($found_tsd->latitude && $found_tsd->longitude) ? "✅ GPS OK" : "❌ GPS manquant";
        echo "      - Table 'terrains_synthetiques_dakar': ID {$found_tsd->id} ($gps_status)\n";
    } else {
        echo "      - Table 'terrains_synthetiques_dakar': ❌ NON TROUVÉ\n";
    }
}

echo "\n🎯 CONCLUSION:\n";
echo "=============\n";
echo "• J'ai utilisé la table: 'terrains'\n";
echo "• Terrains KML extraits: 12\n";
echo "• Terrains mis à jour avec GPS: " . count($terrains_gps ?? []) . "\n";
echo "• Le 13ème terrain vient probablement de la base existante\n";
echo "\n💡 RECOMMANDATION:\n";
echo "Si vous voulez utiliser 'terrains_synthetiques_dakar', il faut:\n";
echo "1. Ajouter les colonnes GPS à cette table\n";
echo "2. Y transférer les coordonnées KML\n";
?> 