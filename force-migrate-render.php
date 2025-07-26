<?php
/**
 * Script pour forcer l'exécution des migrations sur Render
 * Ce script peut être exécuté localement pour déclencher les migrations sur Render
 */

class RenderMigrationForcer {
    private $baseUrl;
    
    public function __construct($baseUrl) {
        $this->baseUrl = rtrim($baseUrl, '/');
    }
    
    /**
     * Force l'exécution des migrations via l'API
     */
    public function forceMigrations() {
        echo "🚀 Forçage des migrations sur Render...\n";
        echo "📍 URL: {$this->baseUrl}\n\n";
        
        // Test 1: Vérifier si l'API répond
        echo "📋 Test 1: Vérification de l'API...\n";
        $statusResult = $this->makeRequest('/api/status');
        
        if ($statusResult['status_code'] !== 200) {
            echo "❌ L'API ne répond pas correctement\n";
            return false;
        }
        
        echo "✅ API fonctionnelle\n\n";
        
        // Test 2: Vérifier l'état de la base de données
        echo "📋 Test 2: Vérification de la base de données...\n";
        $dbResult = $this->makeRequest('/api/test-db');
        
        if ($dbResult['status_code'] === 200) {
            echo "✅ Base de données accessible\n";
        } else {
            echo "⚠️ Problème avec la base de données\n";
        }
        
        // Test 3: Tenter de déclencher les migrations
        echo "\n📋 Test 3: Déclenchement des migrations...\n";
        $migrationResult = $this->makeRequest('/api/force-migrate', 'POST');
        
        if ($migrationResult['status_code'] === 200) {
            echo "✅ Migrations déclenchées avec succès\n";
        } else {
            echo "❌ Impossible de déclencher les migrations via l'API\n";
            echo "   📝 Erreur: " . ($migrationResult['error'] ?? 'Inconnue') . "\n";
        }
        
        // Test 4: Vérifier les tables après migration
        echo "\n📋 Test 4: Vérification des tables...\n";
        $this->checkTables();
        
        return true;
    }
    
    /**
     * Vérifie l'existence des tables principales
     */
    private function checkTables() {
        $tables = [
            'users' => '/api/test-table/users',
            'terrains_synthetiques_dakar' => '/api/test-table/terrains',
            'reservations' => '/api/test-table/reservations',
            'abonnements' => '/api/test-table/abonnements',
            'paiements' => '/api/test-table/paiements'
        ];
        
        foreach ($tables as $tableName => $endpoint) {
            $result = $this->makeRequest($endpoint);
            $status = $result['status_code'] === 200 ? '✅' : '❌';
            echo "   {$status} Table {$tableName}\n";
        }
    }
    
    /**
     * Effectue une requête HTTP
     */
    private function makeRequest($endpoint, $method = 'GET', $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $headers = [
            'Content-Type: application/json',
            'Accept: application/json',
            'User-Agent: Render-Migration-Forcer/1.0'
        ];
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        return [
            'status_code' => $httpCode,
            'response' => $response,
            'error' => $error
        ];
    }
    
    /**
     * Génère un rapport de diagnostic
     */
    public function generateDiagnosticReport() {
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "🔍 RAPPORT DE DIAGNOSTIC RENDER\n";
        echo str_repeat("=", 60) . "\n";
        
        // Test de connectivité
        echo "📡 Test de connectivité...\n";
        $pingResult = $this->makeRequest('/api/status');
        echo "   " . ($pingResult['status_code'] === 200 ? '✅' : '❌') . " API accessible\n";
        
        // Test de base de données
        echo "🗄️ Test de base de données...\n";
        $dbResult = $this->makeRequest('/api/test-db');
        echo "   " . ($dbResult['status_code'] === 200 ? '✅' : '❌') . " Base de données\n";
        
        // Test des tables
        echo "📊 Test des tables...\n";
        $tables = ['users', 'terrains_synthetiques_dakar', 'reservations'];
        foreach ($tables as $table) {
            $result = $this->makeRequest("/api/test-table/{$table}");
            echo "   " . ($result['status_code'] === 200 ? '✅' : '❌') . " Table {$table}\n";
        }
        
        echo "\n🎯 RECOMMANDATIONS:\n";
        echo "1. Si l'API ne répond pas: Vérifiez le déploiement Render\n";
        echo "2. Si la base de données ne répond pas: Vérifiez les variables d'environnement\n";
        echo "3. Si les tables n'existent pas: Les migrations n'ont pas été exécutées\n";
        echo "4. Redéployez manuellement sur Render si nécessaire\n";
    }
}

// Configuration
$baseUrl = 'https://kalel-sa-match.onrender.com'; // Remplacez par votre URL Render

// Lancement du diagnostic
$forcer = new RenderMigrationForcer($baseUrl);

echo "🔧 DIAGNOSTIC RENDER - MIGRATIONS\n";
echo "================================\n\n";

$forcer->forceMigrations();
$forcer->generateDiagnosticReport();

echo "\n📞 Si les migrations ne fonctionnent pas:\n";
echo "1. Allez sur Render Dashboard\n";
echo "2. Trouvez votre service\n";
echo "3. Cliquez sur 'Manual Deploy'\n";
echo "4. Vérifiez les logs de déploiement\n";
echo "5. Assurez-vous que les variables d'environnement sont correctes\n";
?> 