<?php

// Test API directement
$response = file_get_contents("http://127.0.0.1:8000/api/terrains");

if ($response === false) {
    echo "ERREUR: Impossible de contacter l'API\n";
    exit(1);
}

$data = json_decode($response, true);

if (!$data || !isset($data['success'])) {
    echo "ERREUR: Réponse API invalide\n";
    exit(1);
}

$terrains = $data['data']['data'] ?? [];

echo "===========================================\n";
echo "🚨 DIAGNOSTIC URGENT TERRAIN\n";
echo "===========================================\n";
echo "Total terrains API: " . count($terrains) . "\n\n";

$actifs = 0;
$fermes = 0;

foreach ($terrains as $terrain) {
    $status = $terrain['est_actif'] ? "🟢 ACTIF" : "🔴 FERMÉ";
    echo "ID {$terrain['id']}: {$terrain['nom']} - $status\n";
    
    if ($terrain['est_actif']) {
        $actifs++;
    } else {
        $fermes++;
    }
}

echo "\n===========================================\n";
echo "📊 RÉSUMÉ:\n";
echo "🟢 Terrains actifs: $actifs\n";
echo "🔴 Terrains fermés: $fermes\n";
echo "===========================================\n";

if ($fermes > $actifs) {
    echo "\n❌ PROBLÈME DÉTECTÉ!\n";
    echo "Plus de terrains fermés ($fermes) que d'actifs ($actifs)\n";
    echo "➡️ Cela explique pourquoi la carte montre 'fermé'\n";
} else {
    echo "\n✅ Configuration correcte\n";
    echo "➡️ Videz le cache navigateur (Ctrl+F5)\n";
}

echo "\n===========================================\n"; 