<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== VÉRIFICATION DES TERRAINS ET SURFACES ===\n\n";

// Vérifier les terrains avec géométrie PostGIS
$terrainsWithGeometry = DB::table('terrains_synthetiques_dakar')
    ->select([
        'id',
        'nom',
        'surface',
        DB::raw('CASE WHEN geom IS NOT NULL THEN ST_Area(ST_Transform(geom, 32628)) ELSE NULL END as surface_calculee'),
        DB::raw('CASE WHEN geom IS NOT NULL THEN true ELSE false END as has_geometry')
    ])
    ->get();

echo "Terrains avec géométrie PostGIS:\n";
foreach ($terrainsWithGeometry as $terrain) {
    echo "ID: {$terrain->id}, Nom: {$terrain->nom}\n";
    echo "  - Surface manuelle: " . ($terrain->surface ? $terrain->surface . ' m²' : 'N/A') . "\n";
    echo "  - Surface PostGIS: " . ($terrain->surface_calculee ? round($terrain->surface_calculee, 2) . ' m²' : 'N/A') . "\n";
    echo "  - A une géométrie: " . ($terrain->has_geometry ? 'OUI' : 'NON') . "\n";
    echo "\n";
}

// Compter les terrains avec/sans géométrie
$withGeometry = $terrainsWithGeometry->where('has_geometry', true)->count();
$withoutGeometry = $terrainsWithGeometry->where('has_geometry', false)->count();
$total = $terrainsWithGeometry->count();

echo "=== STATISTIQUES ===\n";
echo "Total terrains: {$total}\n";
echo "Avec géométrie PostGIS: {$withGeometry}\n";
echo "Sans géométrie PostGIS: {$withoutGeometry}\n";

if ($withoutGeometry > 0) {
    echo "\n⚠️  {$withoutGeometry} terrains n'ont pas de géométrie PostGIS définie.\n";
    echo "   Pour afficher les surfaces correctement, il faut:\n";
    echo "   1. Importer des fichiers KML/SHP pour ces terrains\n";
    echo "   2. Ou définir manuellement les surfaces dans la base de données\n";
}
