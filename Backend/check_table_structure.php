<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=== STRUCTURE DE LA TABLE TERRAINS ===\n";

// Obtenir la structure de la table
$columns = DB::select("SELECT column_name, data_type, is_nullable, column_default 
                      FROM information_schema.columns 
                      WHERE table_name = 'terrains' 
                      ORDER BY ordinal_position");

foreach ($columns as $column) {
    echo $column->column_name . " (" . $column->data_type . ")" . 
         ("$column->is_nullable" == 'YES' ? ' NULL' : ' NOT NULL') . 
         ("$column->column_default" ? " DEFAULT $column->column_default" : '') . "\n";
}

echo "\n=== DONNÉES DU STADE DEGGO ===\n";
$terrain = DB::table('terrains')->where('nom', 'LIKE', '%Deggo%')->first();
if ($terrain) {
    foreach ($terrain as $key => $value) {
        echo "$key: " . ($value ?? 'NULL') . "\n";
    }
}
