<?php
echo "==================================================================\n";
echo "🔍 DIAGNOSTIC COMPLET TERRAIN ACTIF/INACTIF\n";
echo "==================================================================\n";

// Configuration
$apiBase = "http://localhost:8000/api";
$gestionnaire = ['email' => 'manager@terrain.com', 'password' => 'password123'];

// Configuration de la base de données (ajuster selon votre configuration)
$dbHost = 'localhost';
$dbName = 'terrains_synthetiques';
$dbUser = 'root';
$dbPass = '';

function makeRequest($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['response' => $response, 'http_code' => $httpCode];
}

echo "\n1️⃣ VÉRIFICATION BASE DE DONNÉES\n";
echo "================================\n";

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connexion à la base de données réussie\n";
    
    // Compter tous les terrains
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM terrains_synthetiques_dakar");
    $totalTerrains = $stmt->fetch()['total'];
    echo "📊 Total terrains dans la DB: $totalTerrains\n";
    
    // Compter les terrains actifs
    $stmt = $pdo->query("SELECT COUNT(*) as actifs FROM terrains_synthetiques_dakar WHERE est_actif = 1");
    $terrainsActifs = $stmt->fetch()['actifs'];
    echo "🟢 Terrains actifs dans la DB: $terrainsActifs\n";
    
    // Compter les terrains inactifs
    $stmt = $pdo->query("SELECT COUNT(*) as inactifs FROM terrains_synthetiques_dakar WHERE est_actif = 0");
    $terrainsInactifs = $stmt->fetch()['inactifs'];
    echo "🔴 Terrains inactifs dans la DB: $terrainsInactifs\n";
    
    // Liste détaillée des terrains
    echo "\n📋 DÉTAIL DES TERRAINS:\n";
    $stmt = $pdo->query("SELECT id, nom, name, est_actif FROM terrains_synthetiques_dakar ORDER BY id");
    while ($terrain = $stmt->fetch()) {
        $nom = $terrain['nom'] ?? $terrain['name'] ?? 'Sans nom';
        $statut = $terrain['est_actif'] ? '🟢 ACTIF' : '🔴 INACTIF';
        echo "   - ID {$terrain['id']}: $nom => $statut\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur DB: " . $e->getMessage() . "\n";
}

echo "\n2️⃣ TEST API CLIENT (GET /terrains)\n";
echo "===================================\n";

$clientResult = makeRequest("$apiBase/terrains");
if ($clientResult['http_code'] === 200) {
    $clientData = json_decode($clientResult['response'], true);
    if ($clientData['success']) {
        $terrainsAPI = $clientData['data']['data'] ?? [];
        echo "✅ API client accessible\n";
        echo "📊 Terrains retournés par l'API: " . count($terrainsAPI) . "\n";
        
        echo "\n📋 DÉTAIL DES TERRAINS VIA API:\n";
        foreach ($terrainsAPI as $terrain) {
            $statut = $terrain['est_actif'] ? '🟢 ACTIF' : '🔴 INACTIF';
            $disponible = $terrain['est_disponible'] ? '✅ DISPONIBLE' : '❌ INDISPONIBLE';
            echo "   - ID {$terrain['id']}: {$terrain['nom']} => $statut / $disponible\n";
        }
        
        // Vérifier la cohérence
        if (count($terrainsAPI) == $terrainsActifs) {
            echo "\n✅ COHÉRENCE: Le nombre de terrains API correspond aux terrains actifs DB\n";
        } else {
            echo "\n❌ INCOHÉRENCE: API retourne " . count($terrainsAPI) . " terrains mais DB a $terrainsActifs actifs\n";
        }
    } else {
        echo "❌ Erreur API: " . ($clientData['message'] ?? 'Erreur inconnue') . "\n";
    }
} else {
    echo "❌ Erreur HTTP: " . $clientResult['http_code'] . "\n";
}

echo "\n3️⃣ TEST API NEARBY\n";
echo "==================\n";

$nearbyResult = makeRequest("$apiBase/terrains/nearby?latitude=14.7&longitude=-17.4&radius=50");
if ($nearbyResult['http_code'] === 200) {
    $nearbyData = json_decode($nearbyResult['response'], true);
    if ($nearbyData['success']) {
        $terrainsNearby = $nearbyData['data'] ?? [];
        echo "✅ API nearby accessible\n";
        echo "📊 Terrains nearby: " . count($terrainsNearby) . "\n";
        
        $inactifsNearby = 0;
        foreach ($terrainsNearby as $terrain) {
            if (!($terrain['est_actif'] ?? true)) {
                $inactifsNearby++;
                echo "❌ Terrain inactif trouvé: {$terrain['nom']}\n";
            }
        }
        
        if ($inactifsNearby === 0) {
            echo "✅ Aucun terrain inactif dans nearby\n";
        }
    }
} else {
    echo "❌ Erreur API nearby: " . $nearbyResult['http_code'] . "\n";
}

echo "\n4️⃣ TEST CONNEXION GESTIONNAIRE\n";
echo "===============================\n";

$loginResult = makeRequest("$apiBase/login", 'POST', $gestionnaire);
if ($loginResult['http_code'] === 200) {
    $loginData = json_decode($loginResult['response'], true);
    if ($loginData['success']) {
        $token = $loginData['data']['token'];
        echo "✅ Connexion gestionnaire réussie\n";
        
        // Test de l'API gestionnaire
        echo "\n5️⃣ TEST API GESTIONNAIRE\n";
        echo "========================\n";
        
        $managerResult = makeRequest("$apiBase/manager/terrains", 'GET', null, $token);
        if ($managerResult['http_code'] === 200) {
            $managerData = json_decode($managerResult['response'], true);
            if ($managerData['success']) {
                $terrainsManager = $managerData['data'] ?? [];
                echo "✅ API gestionnaire accessible\n";
                echo "📊 Terrains du gestionnaire: " . count($terrainsManager) . "\n";
                
                if (!empty($terrainsManager)) {
                    $testTerrain = $terrainsManager[0];
                    echo "\n📋 TERRAIN DE TEST:\n";
                    echo "   - ID: {$testTerrain['id']}\n";
                    echo "   - Nom: {$testTerrain['nom']}\n";
                    echo "   - État: " . ($testTerrain['est_actif'] ? '🟢 ACTIF' : '🔴 INACTIF') . "\n";
                    
                    // Test toggle
                    echo "\n6️⃣ TEST TOGGLE TERRAIN\n";
                    echo "======================\n";
                    
                    $toggleResult = makeRequest("$apiBase/manager/terrains/{$testTerrain['id']}/toggle-disponibilite", 'PUT', null, $token);
                    if ($toggleResult['http_code'] === 200) {
                        $toggleData = json_decode($toggleResult['response'], true);
                        if ($toggleData['success']) {
                            $nouvelEtat = $toggleData['data']['est_actif'];
                            echo "✅ Toggle réussi: " . ($nouvelEtat ? '🟢 ACTIF' : '🔴 INACTIF') . "\n";
                            
                            // Revérifier l'API client
                            echo "\n7️⃣ VÉRIFICATION API CLIENT APRÈS TOGGLE\n";
                            echo "========================================\n";
                            
                            sleep(1); // Attendre un peu
                            
                            $clientApres = makeRequest("$apiBase/terrains");
                            if ($clientApres['http_code'] === 200) {
                                $clientDataApres = json_decode($clientApres['response'], true);
                                if ($clientDataApres['success']) {
                                    $terrainsAPIApres = $clientDataApres['data']['data'] ?? [];
                                    echo "📊 Terrains API après toggle: " . count($terrainsAPIApres) . "\n";
                                    
                                    $terrainTrouve = false;
                                    foreach ($terrainsAPIApres as $terrain) {
                                        if ($terrain['id'] == $testTerrain['id']) {
                                            $terrainTrouve = true;
                                            $etatAPI = $terrain['est_actif'] ? '🟢 ACTIF' : '🔴 INACTIF';
                                            echo "🔍 Terrain test dans API: $etatAPI\n";
                                            
                                            if ($terrain['est_actif'] == $nouvelEtat) {
                                                echo "✅ SYNCHRONISATION RÉUSSIE!\n";
                                            } else {
                                                echo "❌ DÉSYNCHRONISATION: API={$terrain['est_actif']}, Manager=$nouvelEtat\n";
                                            }
                                            break;
                                        }
                                    }
                                    
                                    if (!$terrainTrouve && !$nouvelEtat) {
                                        echo "✅ TERRAIN INACTIF CORRECTEMENT EXCLU DE L'API CLIENT!\n";
                                    } else if (!$terrainTrouve && $nouvelEtat) {
                                        echo "❌ TERRAIN ACTIF MANQUANT DANS L'API CLIENT!\n";
                                    }
                                }
                            }
                            
                            // Remettre dans l'état initial
                            makeRequest("$apiBase/manager/terrains/{$testTerrain['id']}/toggle-disponibilite", 'PUT', null, $token);
                        }
                    }
                }
            }
        }
    }
}

echo "\n==================================================================\n";
echo "🏁 DIAGNOSTIC TERMINÉ\n";
echo "==================================================================\n";
echo "Vérifiez les résultats ci-dessus pour identifier le problème.\n";
echo "Si la synchronisation échoue, le problème est identifié!\n";
echo "==================================================================\n"; 