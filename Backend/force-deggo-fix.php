<?php

// Script simple pour corriger le terrain Deggo
echo "=== Correction Simple Terrain Deggo ===\n";

// Configuration de la base de données
$host = 'localhost';
$dbname = 'terrains_synthetiques_db';
$username = 'postgres';
$password = '';

try {
    $pdo = new PDO("pgsql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connexion base de données réussie\n";
    
    // 1. Mettre à jour le terrain principal
    $stmt = $pdo->prepare("UPDATE terrains_synthetiques_dakar SET est_actif = TRUE WHERE id = 6");
    $stmt->execute();
    echo "✅ Terrain principal mis à jour\n";
    
    // 2. Mettre à jour les sous-terrains
    $stmt = $pdo->prepare("UPDATE terrains SET est_disponible = TRUE WHERE terrain_synthetique_id = 6");
    $stmt->execute();
    echo "✅ Sous-terrains mis à jour\n";
    
    // 3. Vérifier le résultat
    $stmt = $pdo->prepare("SELECT id, nom, est_actif FROM terrains_synthetiques_dakar WHERE id = 6");
    $stmt->execute();
    $terrain = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($terrain) {
        echo "📍 RÉSULTAT:\n";
        echo "- ID: " . $terrain['id'] . "\n";
        echo "- Nom: " . $terrain['nom'] . "\n";
        echo "- Est actif: " . ($terrain['est_actif'] ? 'OUI' : 'NON') . "\n";
    }
    
    echo "\n✅ TERRAIN DEGGO MAINTENANT DISPONIBLE !\n";
    echo "🌐 Testez sur: http://localhost:5173/dashboard/map\n";
    
} catch (PDOException $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}
?> 