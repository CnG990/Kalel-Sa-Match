<?php

require 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

$app = require 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

echo "\n=== Comparaison KML vs Base (terrains_synthetiques_dakar) ===\n";

$kmlDirs = [
    __DIR__ . '/../kml',
    __DIR__ . '/../Kalel-Sa-Match/kml',
];

// Collecter fichiers KML
$kmlFiles = [];
foreach ($kmlDirs as $dir) {
    if (is_dir($dir)) {
        foreach (glob($dir . '/*.kml') as $f) {
            $kmlFiles[] = $f;
        }
    }
}

if (empty($kmlFiles)) {
    echo "Aucun fichier KML trouvé.\n";
    exit(0);
}

// Indexer terrains DB par nom simplifié
$terrains = DB::table('terrains_synthetiques_dakar')
    ->select('id','nom','surface', DB::raw('ST_AsText(geom_polygon) as wkt_poly'))
    ->get();

function slug($s) {
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/','-', $s);
    return trim($s,'-');
}

$bySlug = [];
foreach ($terrains as $t) {
    $bySlug[slug($t->nom)] = $t;
}

$mismatches = 0; $matched = 0; $noDbMatch = 0; $withLargeDiff = 0;

foreach ($kmlFiles as $file) {
    $base = basename($file, '.kml');
    $key = slug($base);

    // Lire KML
    $xml = @simplexml_load_file($file);
    if (!$xml) {
        echo "[KML] Impossible de lire: $file\n";
        continue;
    }

    // Extraire la première géométrie (Polygon ou MultiGeometry)
    $kmlString = file_get_contents($file);
    $kmlEscaped = str_replace("'", "''", $kmlString);

    // Laisser PostGIS parser le KML et calculer la surface (en m², UTM 32628)
    try {
        $row = DB::selectOne("select 
            CASE WHEN ST_GeometryType(g) LIKE 'ST_Polygon%' THEN ST_Area(ST_Transform(g,32628))
                 WHEN ST_GeometryType(g) LIKE 'ST_MultiPolygon%' THEN ST_Area(ST_Transform(g,32628))
                 ELSE NULL END as surf,
            ST_AsText(g) as wkt
          from (
            select ST_Force2D(ST_Collect((xpath('//kml:Polygon', x))[1]::geometry,
                                         (xpath('//kml:MultiGeometry', x))[1]::geometry,
                                         (xpath('//kml:MultiPolygon', x))[1]::geometry)) as g
            from (
              select (xpath('/*', xmlparse(document $$${kmlEscaped}$$))) [1] as x
            ) t
          ) q");
    } catch (Exception $e) {
        // Fallback: ST_GeomFromKML simple
        try {
            $row = DB::selectOne("select ST_Area(ST_Transform(ST_Force2D(ST_GeomFromKML($$${kmlEscaped}$$)),32628)) as surf, ST_AsText(ST_Force2D(ST_GeomFromKML($$${kmlEscaped}$$))) as wkt");
        } catch (Exception $e2) {
            echo "[KML] Erreur PostGIS sur $base: ".$e2->getMessage()."\n";
            continue;
        }
    }

    $kmlSurface = $row && isset($row->surf) ? (float)$row->surf : null;

    if (!isset($bySlug[$key])) {
        echo "[NO MATCH] $base (KML: ".number_format((float)$kmlSurface,2,'.','')." m²) -> aucun terrain DB par nom\n";
        $noDbMatch++;
        continue;
    }

    $db = $bySlug[$key];
    $dbSurface = $db->surface ? (float)$db->surface : 0.0;

    $diff = $kmlSurface !== null ? abs($dbSurface - $kmlSurface) : null;
    $pct = ($kmlSurface && $dbSurface) ? ($diff / max($kmlSurface,$dbSurface)) * 100.0 : null;

    if ($kmlSurface === null) {
        echo "[KML SURFACE NA] $base -> DB: ".$dbSurface." m²\n";
        $mismatches++;
        continue;
    }

    if ($pct !== null && $pct <= 10.0) {
        echo "[OK] $base -> DB: ".number_format($dbSurface,2,'.','')." m², KML: ".number_format($kmlSurface,2,'.','')." m² (diff ".number_format($pct,2)."%)\n";
        $matched++;
    } else {
        echo "[DIFF] $base -> DB: ".number_format($dbSurface,2,'.','')." m², KML: ".number_format($kmlSurface,2,'.','')." m²";
        if ($pct !== null) echo " (diff ".number_format($pct,2)."%)";
        echo "\n";
        $mismatches++;
        if ($pct !== null && $pct > 25.0) $withLargeDiff++;
    }
}

echo "\nRésumé:\n";
echo "  KML trouvés: ".count($kmlFiles)."\n";
echo "  Appariements OK (<=10%): {$matched}\n";
echo "  Différences: {$mismatches}, dont >25%: {$withLargeDiff}\n";
echo "  Sans correspondance DB: {$noDbMatch}\n";





