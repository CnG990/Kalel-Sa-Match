<?php

require 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

$app = require 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

echo "\n=== Vérification cohérence terrains (coordonnées/surfaces) ===\n";

$terrains = DB::table('terrains_synthetiques_dakar')
    ->select('id','nom','latitude','longitude','surface', DB::raw('ST_AsText(geom_polygon) as wkt_poly'), DB::raw('ST_AsText(geom) as wkt_point'))
    ->orderBy('id')
    ->get();

$total = count($terrains);
$invalidCoords = 0;
$missingSurface = 0;
$polyPresent = 0;
$polyMissing = 0;

foreach ($terrains as $t) {
    $issues = [];
    if (!isset($t->latitude) || !isset($t->longitude) || $t->latitude == 0 || $t->longitude == 0) {
        $invalidCoords++;
        $issues[] = 'coords_invalides';
    }
    if (!$t->surface || $t->surface <= 0) {
        $missingSurface++;
        $issues[] = 'surface_absente';
    }
    if (!empty($t->wkt_poly)) { $polyPresent++; } else { $polyMissing++; }

    if (!empty($issues)) {
        echo "- {$t->id} {$t->nom} : ".implode(',', $issues)."\n";
    }
}

echo "\nTotal: {$total}\n";
echo "Coordonnées invalides: {$invalidCoords}\n";
echo "Surface manquante/0: {$missingSurface}\n";
echo "Polygones présents: {$polyPresent}, manquants: {$polyMissing}\n";

// Vérifier un échantillon pour la carte
$sample = DB::table('terrains_synthetiques_dakar')
    ->select('id','nom','latitude','longitude','surface')
    ->limit(3)
    ->get();

echo "\nÉchantillon:\n";
foreach ($sample as $s) {
    echo json_encode($s, JSON_UNESCAPED_UNICODE)."\n";
}





