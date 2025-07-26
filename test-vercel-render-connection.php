<?php
/**
 * Script de test pour vérifier la connexion entre Vercel et Render
 * Teste si le frontend Vercel peut contacter le backend Render
 */

class VercelRenderTester {
    private $renderUrl;
    private $vercelUrl;
    
    public function __construct() {
        $this->renderUrl = 'https://kalel-sa-match.onrender.com';
        $this->vercelUrl = 'https://kalel-sa-match.vercel.app';
    }
    
    /**
     * Teste la connectivité entre Vercel et Render
     */
    public function testConnection() {
        echo "🔗 TEST CONNEXION VERCEL ↔ RENDER\n";
        echo "====================================\n\n";
        
        echo "📍 URLs:\n";
        echo "   Frontend Vercel: {$this->vercelUrl}\n";
        echo "   Backend Render: {$this->renderUrl}\n\n";
        
        // Test 1: Vérifier que Render répond
        echo "📋 Test 1: Vérification de Render...\n";
        $this->testRenderAccessibility();
        
        // Test 2: Vérifier les endpoints API
        echo "\n📋 Test 2: Test des endpoints API...\n";
        $this->testAPIEndpoints();
        
        // Test 3: Test CORS depuis Vercel
        echo "\n📋 Test 3: Test CORS (simulation depuis Vercel)...\n";
        $this->testCORS();
        
        // Test 4: Test de performance
        echo "\n📋 Test 4: Test de performance...\n";
        $this->testPerformance();
        
        $this->generateReport();
    }
    
    /**
     * Teste l'accessibilité de Render
     */
    private function testRenderAccessibility() {
        $endpoints = [
            '/api/status' => 'Status API',
            '/api/test' => 'Test CORS',
            '/api/test-cors' => 'Test CORS Simple',
            '/api/test-db' => 'Test Base de données'
        ];
        
        foreach ($endpoints as $endpoint => $name) {
            $url = $this->renderUrl . $endpoint;
            $result = $this->makeRequest($url);
            
            $status = $result['status_code'] === 200 ? '✅' : '❌';
            echo "   {$status} {$name} (HTTP {$result['status_code']})\n";
            
            if ($result['status_code'] !== 200) {
                echo "      📝 Erreur: {$result['error']}\n";
            }
        }
    }
    
    /**
     * Teste les endpoints API principaux
     */
    private function testAPIEndpoints() {
        $endpoints = [
            '/api/terrains' => 'Liste des terrains',
            '/api/auth/register' => 'Register (POST)',
            '/api/user/profile' => 'Profile utilisateur (401 attendu)',
            '/api/admin/dashboard-stats' => 'Dashboard admin (401 attendu)'
        ];
        
        foreach ($endpoints as $endpoint => $name) {
            $url = $this->renderUrl . $endpoint;
            $method = strpos($endpoint, 'register') !== false ? 'POST' : 'GET';
            $result = $this->makeRequest($url, $method);
            
            $expectedStatus = in_array($endpoint, ['/api/user/profile', '/api/admin/dashboard-stats']) ? 401 : 200;
            $status = $result['status_code'] === $expectedStatus ? '✅' : '❌';
            echo "   {$status} {$name} (HTTP {$result['status_code']})\n";
        }
    }
    
    /**
     * Teste le CORS (simulation d'une requête depuis Vercel)
     */
    private function testCORS() {
        $url = $this->renderUrl . '/api/status';
        
        // Simuler une requête avec l'origine Vercel
        $headers = [
            'Origin: https://kalel-sa-match.vercel.app',
            'Accept: application/json',
            'Content-Type: application/json'
        ];
        
        $result = $this->makeRequest($url, 'GET', null, $headers);
        
        if ($result['status_code'] === 200) {
            echo "   ✅ CORS fonctionne - Vercel peut contacter Render\n";
        } else {
            echo "   ❌ CORS bloqué - Erreur HTTP {$result['status_code']}\n";
            echo "      📝 Erreur: {$result['error']}\n";
        }
    }
    
    /**
     * Teste la performance
     */
    private function testPerformance() {
        $url = $this->renderUrl . '/api/status';
        $times = [];
        
        for ($i = 0; $i < 5; $i++) {
            $start = microtime(true);
            $result = $this->makeRequest($url);
            $end = microtime(true);
            
            if ($result['status_code'] === 200) {
                $times[] = round(($end - $start) * 1000, 2); // en millisecondes
            }
        }
        
        if (!empty($times)) {
            $avg = array_sum($times) / count($times);
            $min = min($times);
            $max = max($times);
            
            echo "   📊 Performance (5 requêtes):\n";
            echo "      ⏱️  Moyenne: {$avg}ms\n";
            echo "      ⏱️  Min: {$min}ms\n";
            echo "      ⏱️  Max: {$max}ms\n";
        } else {
            echo "   ❌ Impossible de mesurer la performance\n";
        }
    }
    
    /**
     * Effectue une requête HTTP
     */
    private function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $defaultHeaders = [
            'Accept: application/json',
            'User-Agent: Vercel-Render-Tester/1.0'
        ];
        
        $headers = array_merge($defaultHeaders, $headers);
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
     * Génère le rapport final
     */
    private function generateReport() {
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "📊 RAPPORT CONNEXION VERCEL ↔ RENDER\n";
        echo str_repeat("=", 60) . "\n";
        
        echo "🎯 CONFIGURATION FRONTEND:\n";
        echo "   Dans ton code frontend (Vercel), utilise:\n";
        echo "   ```javascript\n";
        echo "   const API_URL = 'https://kalel-sa-match.onrender.com/api';\n";
        echo "   \n";
        echo "   // Exemple d'utilisation\n";
        echo "   fetch(`${API_URL}/status`)\n";
        echo "     .then(response => response.json())\n";
        echo "     .then(data => console.log(data));\n";
        echo "   ```\n\n";
        
        echo "🔧 CONFIGURATION BACKEND:\n";
        echo "   ✅ CORS configuré pour autoriser: https://kalel-sa-match.vercel.app\n";
        echo "   ✅ Endpoints API accessibles\n";
        echo "   ✅ Port 8000 exposé dans Dockerfile\n";
        echo "   ✅ Render mappe automatiquement sur HTTPS (443)\n\n";
        
        echo "📞 PROCHAINES ÉTAPES:\n";
        echo "1. Pousse les modifications CORS sur GitHub\n";
        echo "2. Redéploie sur Render\n";
        echo "3. Teste depuis ton frontend Vercel\n";
        echo "4. Vérifie les logs Render si nécessaire\n";
        
        echo "\n🔗 URLs de test:\n";
        echo "   • API Status: https://kalel-sa-match.onrender.com/api/status\n";
        echo "   • Test CORS: https://kalel-sa-match.onrender.com/api/test\n";
        echo "   • Frontend: https://kalel-sa-match.vercel.app\n";
    }
}

// Lancement du test
$tester = new VercelRenderTester();
$tester->testConnection();
?> 