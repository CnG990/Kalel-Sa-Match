<?php
/**
 * Script de test pour l'API locale Kalel Sa Match
 * Teste l'API sur localhost:8000
 */

class LocalAPITester {
    private $baseUrl;
    private $results = [];
    private $startTime;
    
    public function __construct($baseUrl = 'http://localhost:8000') {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->startTime = microtime(true);
    }
    
    /**
     * Effectue une requête HTTP
     */
    private function makeRequest($endpoint, $method = 'GET', $data = null, $headers = []) {
        $url = $this->baseUrl . $endpoint;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Timeout plus court pour local
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        // Headers par défaut
        $defaultHeaders = [
            'Content-Type: application/json',
            'Accept: application/json',
            'User-Agent: Kalel-Sa-Match-Local-Tester/1.0'
        ];
        
        $headers = array_merge($defaultHeaders, $headers);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        if ($method === 'POST' || $method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
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
            'error' => $error,
            'url' => $url
        ];
    }
    
    /**
     * Teste un endpoint et enregistre le résultat
     */
    private function testEndpoint($name, $endpoint, $method = 'GET', $data = null, $expectedStatus = 200) {
        echo "🔍 Test: $name... ";
        
        $result = $this->makeRequest($endpoint, $method, $data);
        
        $success = $result['status_code'] === $expectedStatus;
        $status = $success ? '✅' : '❌';
        
        echo "$status (HTTP {$result['status_code']})\n";
        
        if (!$success) {
            echo "   📝 Erreur: {$result['error']}\n";
            if ($result['response']) {
                $responseData = json_decode($result['response'], true);
                if ($responseData && isset($responseData['message'])) {
                    echo "   📝 Message: {$responseData['message']}\n";
                }
            }
        }
        
        $this->results[$name] = [
            'success' => $success,
            'status_code' => $result['status_code'],
            'response' => $result['response'],
            'error' => $result['error']
        ];
        
        return $success;
    }
    
    /**
     * Lance tous les tests
     */
    public function runTests() {
        echo "🚀 Démarrage des tests de l'API locale Kalel Sa Match\n";
        echo "📍 URL de base: {$this->baseUrl}\n";
        echo "⏰ Début: " . date('Y-m-d H:i:s') . "\n\n";
        
        // Tests de base (sans authentification)
        echo "📋 === TESTS DE BASE ===\n";
        $this->testEndpoint('Status API', '/api/status');
        $this->testEndpoint('Test CORS', '/api/test');
        $this->testEndpoint('Test CORS Simple', '/api/test-cors');
        
        // Tests de diagnostic
        echo "\n🔧 === TESTS DE DIAGNOSTIC ===\n";
        $this->testEndpoint('Test Base de données', '/api/test-db');
        $this->testEndpoint('Status Migrations', '/api/migration-status');
        $this->testEndpoint('Test Table Users', '/api/test-table/users');
        $this->testEndpoint('Test Table Terrains', '/api/test-table/terrains_synthetiques_dakar');
        
        // Tests des terrains (publiques)
        echo "\n🏟️ === TESTS TERRAINS (PUBLICS) ===\n";
        $this->testEndpoint('Liste des terrains', '/api/terrains');
        $this->testEndpoint('Terrains pour carte', '/api/terrains/all-for-map');
        $this->testEndpoint('Terrains populaires', '/api/terrains/popular');
        $this->testEndpoint('Recherche par localisation', '/api/terrains/search/by-location');
        
        // Tests d'authentification
        echo "\n🔐 === TESTS AUTHENTIFICATION ===\n";
        $this->testEndpoint('Register (données invalides)', '/api/auth/register', 'POST', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password'
        ], 422); // Attendu: validation error
        
        $this->testEndpoint('Login (données invalides)', '/api/auth/login', 'POST', [
            'email' => 'test@example.com',
            'password' => 'password'
        ], 401); // Attendu: unauthorized
        
        // Tests de vérification de disponibilité
        echo "\n📅 === TESTS DISPONIBILITÉ ===\n";
        $this->testEndpoint('Check disponibilité (publique)', '/api/reservations/check-availability', 'POST', [
            'terrain_id' => 1,
            'date' => date('Y-m-d'),
            'heure_debut' => '10:00',
            'heure_fin' => '12:00'
        ], 422); // Attendu: validation error sans terrain_id valide
        
        // Tests des endpoints protégés (sans token)
        echo "\n🔒 === TESTS ENDPOINTS PROTÉGÉS (SANS AUTH) ===\n";
        $this->testEndpoint('Profile utilisateur (sans auth)', '/api/user/profile', 'GET', null, 401);
        $this->testEndpoint('Mes réservations (sans auth)', '/api/reservations/my-reservations', 'GET', null, 401);
        $this->testEndpoint('Favoris (sans auth)', '/api/user/favorites', 'GET', null, 401);
        
        // Tests des endpoints admin (sans auth)
        echo "\n👨‍💼 === TESTS ENDPOINTS ADMIN (SANS AUTH) ===\n";
        $this->testEndpoint('Dashboard admin (sans auth)', '/api/admin/dashboard-stats', 'GET', null, 401);
        $this->testEndpoint('Utilisateurs admin (sans auth)', '/api/admin/users', 'GET', null, 401);
        $this->testEndpoint('Terrains admin (sans auth)', '/api/admin/terrains', 'GET', null, 401);
        
        // Tests des endpoints gestionnaire (sans auth)
        echo "\n👷 === TESTS ENDPOINTS GESTIONNAIRE (SANS AUTH) ===\n";
        $this->testEndpoint('Terrains gestionnaire (sans auth)', '/api/manager/terrains', 'GET', null, 401);
        $this->testEndpoint('Réservations gestionnaire (sans auth)', '/api/manager/reservations', 'GET', null, 401);
        
        // Tests des webhooks
        echo "\n🔗 === TESTS WEBHOOKS ===\n";
        $this->testEndpoint('Webhook paiement (données invalides)', '/api/paiements/webhook', 'POST', [
            'status' => 'test'
        ], 422); // Attendu: validation error
        
        // Tests des notifications
        echo "\n🔔 === TESTS NOTIFICATIONS (SANS AUTH) ===\n";
        $this->testEndpoint('Notifications (sans auth)', '/api/notifications', 'GET', null, 401);
        $this->testEndpoint('Notifications non lues (sans auth)', '/api/notifications/unread-count', 'GET', null, 401);
        
        // Tests des favoris
        echo "\n⭐ === TESTS FAVORIS (SANS AUTH) ===\n";
        $this->testEndpoint('Favoris (sans auth)', '/api/favorites', 'GET', null, 401);
        
        // Tests des analyses
        echo "\n📊 === TESTS ANALYSES ===\n";
        $this->testEndpoint('Track événement', '/api/analytics/events', 'POST', [
            'event' => 'test_event',
            'data' => ['test' => true]
        ], 401); // Attendu: unauthorized sans auth
        
        // Tests des messages
        echo "\n💬 === TESTS MESSAGES (SANS AUTH) ===\n";
        $this->testEndpoint('Conversations (sans auth)', '/api/messages/conversations', 'GET', null, 401);
        
        // Tests des paiements
        echo "\n💳 === TESTS PAIEMENTS (SANS AUTH) ===\n";
        $this->testEndpoint('Mes paiements (sans auth)', '/api/payments/my-payments', 'GET', null, 401);
        
        // Test de fallback
        echo "\n❓ === TESTS FALLBACK ===\n";
        $this->testEndpoint('Endpoint inexistant', '/api/endpoint-inexistant', 'GET', null, 404);
        
        $this->generateReport();
    }
    
    /**
     * Génère le rapport final
     */
    private function generateReport() {
        $endTime = microtime(true);
        $duration = round($endTime - $this->startTime, 2);
        
        $totalTests = count($this->results);
        $successfulTests = count(array_filter($this->results, function($result) {
            return $result['success'];
        }));
        $failedTests = $totalTests - $successfulTests;
        
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "📊 RAPPORT FINAL DES TESTS LOCAUX\n";
        echo str_repeat("=", 60) . "\n";
        echo "⏰ Durée totale: {$duration} secondes\n";
        echo "📈 Tests réussis: {$successfulTests}/{$totalTests}\n";
        echo "📉 Tests échoués: {$failedTests}/{$totalTests}\n";
        echo "📊 Taux de réussite: " . round(($successfulTests / $totalTests) * 100, 1) . "%\n\n";
        
        if ($failedTests > 0) {
            echo "❌ TESTS ÉCHOUÉS:\n";
            foreach ($this->results as $name => $result) {
                if (!$result['success']) {
                    echo "   • {$name} (HTTP {$result['status_code']})\n";
                }
            }
        }
        
        echo "\n✅ TESTS RÉUSSIS:\n";
        foreach ($this->results as $name => $result) {
            if ($result['success']) {
                echo "   • {$name} (HTTP {$result['status_code']})\n";
            }
        }
        
        echo "\n🎯 RÉSUMÉ:\n";
        if ($successfulTests === $totalTests) {
            echo "   🎉 Tous les tests sont passés ! L'API locale fonctionne parfaitement.\n";
        } elseif ($successfulTests > ($totalTests * 0.8)) {
            echo "   ✅ La plupart des tests sont passés. L'API locale fonctionne bien.\n";
        } elseif ($successfulTests > ($totalTests * 0.5)) {
            echo "   ⚠️ Certains tests ont échoué. Vérifiez la configuration locale.\n";
        } else {
            echo "   ❌ Beaucoup de tests ont échoué. L'API locale a des problèmes.\n";
        }
        
        echo "\n🔗 URL testée: {$this->baseUrl}\n";
        echo "📅 Date: " . date('Y-m-d H:i:s') . "\n";
        echo "\n💡 CONSEILS:\n";
        echo "   • Si le serveur ne démarre pas: Vérifiez que le port 8000 est libre\n";
        echo "   • Si la base de données ne répond pas: Vérifiez votre .env local\n";
        echo "   • Si les migrations échouent: Exécutez 'php artisan migrate'\n";
    }
}

// Configuration
$baseUrl = 'http://localhost:8000';

// Lancement des tests
$tester = new LocalAPITester($baseUrl);
$tester->runTests();
?> 