<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;

// Configuration base de données
$capsule = new DB;
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => 'localhost',
    'database'  => 'terrains_synthetiques',
    'username'  => 'root',
    'password'  => '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "🔍 DIAGNOSTIC API TERRAINS\n";
echo "==========================\n\n";

try {
    // Vérifier la table terrains_synthetiques_dakar
    echo "📊 Terrains dans terrains_synthetiques_dakar:\n";
    $terrains = DB::table('terrains_synthetiques_dakar')->get();
    
    echo "📈 Total: " . count($terrains) . " terrains\n\n";
    
    $terrainsWithCoords = 0;
    $terrainsWithoutCoords = 0;
    
    foreach ($terrains as $i => $terrain) {
        $hasCoords = !empty($terrain->latitude) && !empty($terrain->longitude) && 
                    $terrain->latitude != 0 && $terrain->longitude != 0;
        
        if ($hasCoords) {
            $terrainsWithCoords++;
            echo sprintf("✅ %d. %s (lat: %s, lng: %s)\n", 
                $i + 1, 
                $terrain->nom, 
                $terrain->latitude, 
                $terrain->longitude
            );
        } else {
            $terrainsWithoutCoords++;
            echo sprintf("❌ %d. %s (lat: %s, lng: %s) - COORDONNÉES MANQUANTES\n", 
                $i + 1, 
                $terrain->nom, 
                $terrain->latitude ?? 'NULL', 
                $terrain->longitude ?? 'NULL'
            );
        }
    }
    
    echo "\n📊 RÉSUMÉ:\n";
    echo "✅ Terrains avec coordonnées: $terrainsWithCoords\n";
    echo "❌ Terrains sans coordonnées: $terrainsWithoutCoords\n";
    echo "📈 Total dans BDD: " . count($terrains) . "\n\n";

    // Tester l'API
    echo "🌐 Test de l'API:\n";
    $apiUrl = 'http://127.0.0.1:8000/api/terrains';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200 && $response) {
        $data = json_decode($response, true);
        
        if ($data && $data['success'] && isset($data['data'])) {
            $apiTerrains = is_array($data['data']) ? $data['data'] : $data['data']['data'] ?? [];
            echo "✅ API répond: " . count($apiTerrains) . " terrains\n";
            
            // Comparer avec la BDD
            $bddIds = collect($terrains)->pluck('id')->toArray();
            $apiIds = collect($apiTerrains)->pluck('id')->toArray();
            
            $missingInApi = array_diff($bddIds, $apiIds);
            $extraInApi = array_diff($apiIds, $bddIds);
            
            if (!empty($missingInApi)) {
                echo "\n❌ Terrains manquants dans l'API:\n";
                foreach ($missingInApi as $missingId) {
                    $terrain = collect($terrains)->firstWhere('id', $missingId);
                    echo "  - ID $missingId: {$terrain->nom}\n";
                }
            }
            
            if (!empty($extraInApi)) {
                echo "\n⚠️ Terrains en trop dans l'API:\n";
                foreach ($extraInApi as $extraId) {
                    echo "  - ID $extraId\n";
                }
            }
            
            if (empty($missingInApi) && empty($extraInApi)) {
                echo "✅ L'API retourne tous les terrains de la BDD\n";
            }
            
        } else {
            echo "❌ Format de réponse API invalide\n";
        }
    } else {
        echo "❌ API inaccessible (HTTP $httpCode)\n";
    }

} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}

echo "\n✅ Diagnostic terminé.\n"; 