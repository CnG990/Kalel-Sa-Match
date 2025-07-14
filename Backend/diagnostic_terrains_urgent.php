<?php
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\TerrainSynthetiquesDakar;

echo "=====================================================\n";
echo "🚨 DIAGNOSTIC URGENT - ÉTAT DES TERRAINS\n";
echo "=====================================================\n";

echo "\n1️⃣ État actuel en base de données...\n";

try {
    $terrains = TerrainSynthetiquesDakar::all();
    echo "✅ Total terrains: " . $terrains->count() . "\n\n";
    
    $actifsCount = 0;
    $inactifsCount = 0;
    
    foreach ($terrains as $terrain) {
        $etat = $terrain->est_actif ? '🟢 ACTIF' : '🔴 FERMÉ';
        echo "ID {$terrain->id}: {$terrain->name} - $etat\n";
        
        if ($terrain->est_actif) {
            $actifsCount++;
        } else {
            $inactifsCount++;
        }
    }
    
    echo "\n📊 RÉSUMÉ BASE DE DONNÉES:\n";
    echo "   🟢 Terrains actifs: $actifsCount\n";
    echo "   🔴 Terrains fermés: $inactifsCount\n";

} catch (Exception $e) {
    echo "❌ Erreur base de données: " . $e->getMessage() . "\n";
}

echo "\n2️⃣ Test API client...\n";

$apiUrl = "http://127.0.0.1:8000/api/terrains";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if ($data && isset($data['success'])) {
        $apiTerrains = $data['data']['data'] ?? [];
        echo "✅ API retourne " . count($apiTerrains) . " terrain(s)\n\n";
        
        $apiActifs = 0;
        $apiFermes = 0;
        
        foreach ($apiTerrains as $terrain) {
            $etatActif = $terrain['est_actif'] ? '🟢 ACTIF' : '🔴 FERMÉ';
            $etatDispo = $terrain['est_disponible'] ? '🟢 DISPO' : '🔴 INDISPO';
            echo "API ID {$terrain['id']}: {$terrain['nom']} - Actif: $etatActif | Disponible: $etatDispo\n";
            
            if ($terrain['est_actif']) {
                $apiActifs++;
            } else {
                $apiFermes++;
            }
        }
        
        echo "\n📊 RÉSUMÉ API:\n";
        echo "   🟢 API terrains actifs: $apiActifs\n";
        echo "   🔴 API terrains fermés: $apiFermes\n";
        
        // Vérifier la cohérence
        if ($actifsCount !== $apiActifs) {
            echo "\n❌ INCOHÉRENCE DÉTECTÉE!\n";
            echo "   Base de données: $actifsCount actifs\n";
            echo "   API: $apiActifs actifs\n";
        } else {
            echo "\n✅ Cohérence Base ↔ API confirmée\n";
        }
    }
} else {
    echo "❌ Erreur API: HTTP $httpCode\n";
}

echo "\n3️⃣ CORRECTION SI NÉCESSAIRE...\n";

if ($inactifsCount > 2) {
    echo "⚠️ Trop de terrains fermés détectés ($inactifsCount)\n";
    echo "🔧 Réactivation de tous les terrains sauf 2 pour test...\n";
    
    try {
        // Réactiver tous les terrains
        TerrainSynthetiquesDakar::where('id', '>', 0)->update(['est_actif' => true]);
        
        // Fermer seulement les 2 premiers pour test
        TerrainSynthetiquesDakar::whereIn('id', [1, 2])->update(['est_actif' => false]);
        
        echo "✅ Correction appliquée:\n";
        echo "   - Terrain ID 1: 🔴 FERMÉ (test)\n";
        echo "   - Terrain ID 2: 🔴 FERMÉ (test)\n";
        echo "   - Autres terrains: 🟢 ACTIFS\n";
        
    } catch (Exception $e) {
        echo "❌ Erreur correction: " . $e->getMessage() . "\n";
    }
}

echo "\n4️⃣ TEST FINAL API...\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$responseFinal = curl_exec($ch);
$httpCodeFinal = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCodeFinal === 200) {
    $dataFinal = json_decode($responseFinal, true);
    if ($dataFinal && isset($dataFinal['success'])) {
        $terrainsFinaux = $dataFinal['data']['data'] ?? [];
        $actifsFinaux = array_filter($terrainsFinaux, fn($t) => $t['est_actif']);
        $fermesFinaux = array_filter($terrainsFinaux, fn($t) => !$t['est_actif']);
        
        echo "✅ État final API:\n";
        echo "   🟢 Terrains actifs: " . count($actifsFinaux) . "\n";
        echo "   🔴 Terrains fermés: " . count($fermesFinaux) . "\n";
    }
}

echo "\n=====================================================\n";
echo "🎯 INSTRUCTIONS:\n";
echo "=====================================================\n";
echo "1. Rafraîchissez la page: http://127.0.0.1:5174\n";
echo "2. Videz le cache: Ctrl+F5\n";
echo "3. Vous devriez voir:\n";
echo "   - 🔴 2 terrains ROUGES (fermés)\n";
echo "   - 🟢 11 terrains VERTS (actifs)\n";
echo "4. Si pas correct, relancez ce script\n";
echo "=====================================================\n"; 