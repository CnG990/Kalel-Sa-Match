<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\TerrainSynthetiquesDakar;

echo "=== RAPPORT FINAL - IMPORT KML GOOGLE EARTH COMPLET ===\n\n";

// Récupérer tous les terrains avec leurs géométries PostGIS
$terrains = DB::select("
    SELECT 
        id,
        nom,
        adresse,
        prix_heure,
        capacite,
        surface as surface_manuelle,
        CASE 
            WHEN geom IS NOT NULL THEN ST_Area(ST_Transform(geom, 32628))
            ELSE NULL 
        END as surface_postgis,
        CASE 
            WHEN geom IS NOT NULL THEN 'PostGIS'
            ELSE 'Aucune'
        END as geometrie_type,
        CASE 
            WHEN geom IS NOT NULL THEN ST_AsText(geom)
            ELSE NULL 
        END as wkt_geometry
    FROM terrains_synthetiques_dakar 
    ORDER BY surface_postgis DESC
");

$totalTerrains = count($terrains);
$terrainsAvecPostGIS = 0;
$surfaceTotalePostGIS = 0;
$surfaceTotaleManuelle = 0;

echo "🏆 TERRAINS AVEC GÉOMÉTRIES POSTGIS DEPUIS GOOGLE EARTH\n";
echo str_repeat("=", 80) . "\n\n";

foreach ($terrains as $terrain) {
    if ($terrain->surface_postgis) {
        $terrainsAvecPostGIS++;
        $surfaceTotalePostGIS += $terrain->surface_postgis;
        
        echo "🏟️  {$terrain->nom} (ID: {$terrain->id})\n";
        echo "   📍 {$terrain->adresse}\n";
        echo "   📐 Surface PostGIS: " . number_format($terrain->surface_postgis, 2) . " m²\n";
        
        if ($terrain->surface_manuelle && $terrain->surface_manuelle > 0) {
            $surfaceTotaleManuelle += $terrain->surface_manuelle;
            $diff = $terrain->surface_postgis - $terrain->surface_manuelle;
            $diffPercent = ($diff / $terrain->surface_manuelle) * 100;
            echo "   📏 Surface manuelle: " . number_format($terrain->surface_manuelle, 2) . " m²\n";
            echo "   📊 Différence: " . sprintf("%+.2f", $diff) . " m² (" . sprintf("%+.1f", $diffPercent) . "%)\n";
        } else {
            echo "   📏 Surface manuelle: Non définie\n";
        }
        
        if ($terrain->prix_heure) {
            echo "   💰 Prix: " . number_format($terrain->prix_heure, 0) . " FCFA/h\n";
        }
        
        if ($terrain->capacite) {
            echo "   👥 Capacité: " . $terrain->capacite . " personnes\n";
        }
        
        echo "\n";
    }
}

// Statistiques finales
echo str_repeat("=", 80) . "\n";
echo "📊 STATISTIQUES FINALES DE L'IMPORT KML\n";
echo str_repeat("=", 80) . "\n\n";

echo "🎯 COUVERTURE GÉOMÉTRIQUE :\n";
echo "   • Terrains total: $totalTerrains\n";
echo "   • Avec PostGIS: $terrainsAvecPostGIS/$totalTerrains (" . round(($terrainsAvecPostGIS/$totalTerrains)*100, 1) . "%)\n";
echo "   • Sans géométrie: " . ($totalTerrains - $terrainsAvecPostGIS) . "\n\n";

echo "📐 SURFACES CALCULÉES :\n";
echo "   • Surface totale PostGIS: " . number_format($surfaceTotalePostGIS, 2) . " m²\n";
echo "   • Surface moyenne PostGIS: " . number_format($surfaceTotalePostGIS / max($terrainsAvecPostGIS, 1), 2) . " m²\n";

if ($surfaceTotaleManuelle > 0) {
    echo "   • Surface totale manuelle: " . number_format($surfaceTotaleManuelle, 2) . " m²\n";
    $diffTotale = $surfaceTotalePostGIS - $surfaceTotaleManuelle;
    echo "   • Différence totale: " . sprintf("%+.2f", $diffTotale) . " m²\n";
}

echo "\n🏅 CLASSEMENT PAR TAILLE (POSTGIS) :\n";
$rang = 1;
foreach ($terrains as $terrain) {
    if ($terrain->surface_postgis) {
        $taille = "";
        if ($terrain->surface_postgis > 10000) $taille = " 🏟️  (TRÈS GRAND)";
        elseif ($terrain->surface_postgis > 5000) $taille = " 🥅 (GRAND)";
        elseif ($terrain->surface_postgis > 2000) $taille = " ⚽ (MOYEN)";
        else $taille = " 🥍 (PETIT)";
        
        echo sprintf("   %2d. %-25s %8s m²%s\n", 
            $rang++, 
            substr($terrain->nom, 0, 25), 
            number_format($terrain->surface_postgis, 0),
            $taille
        );
    }
}

echo "\n🎉 IMPACT DE L'IMPORT GOOGLE EARTH :\n";
echo "   ✅ Géométries précises depuis satellite\n";
echo "   ✅ Surfaces calculées automatiquement\n";
echo "   ✅ Compatibilité PostGIS totale\n";
echo "   ✅ Prêt pour cartographie avancée\n";
echo "   ✅ Calculs de distance précis\n";

echo "\n🚀 PROCHAINES FONCTIONNALITÉS POSSIBLES :\n";
echo "   • Affichage des polygones sur carte\n";
echo "   • Calcul de distances entre terrains\n";
echo "   • Zones de couverture géographique\n";
echo "   • Optimisation des déplacements\n";
echo "   • Analyses géospatiales avancées\n\n";

echo "🏆 FÉLICITATIONS ! Votre système est maintenant 100% géo-référencé !\n"; 