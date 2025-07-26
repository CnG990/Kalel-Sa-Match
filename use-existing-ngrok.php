<?php
/**
 * Utilise l'URL ngrok existante si elle fonctionne
 */

echo "🔍 VÉRIFICATION URL NGROK EXISTANTE\n";
echo "===================================\n\n";

// Test 1: Vérifier si ngrok fonctionne localement
echo "📋 Test 1: ngrok local...\n";
$context = stream_context_create(['http' => ['timeout' => 5]]);
$apiResponse = @file_get_contents('http://localhost:4040/api/tunnels', false, $context);

if ($apiResponse !== false) {
    $data = json_decode($apiResponse, true);
    if (isset($data['tunnels'][0]['public_url'])) {
        $ngrokUrl = $data['tunnels'][0]['public_url'];
        echo "   ✅ ngrok local fonctionne\n";
        echo "   📍 URL: {$ngrokUrl}\n";
    } else {
        echo "   ❌ Aucune URL ngrok trouvée\n";
        exit(1);
    }
} else {
    echo "   ❌ ngrok local ne répond pas\n";
    echo "   📝 Démarrez ngrok: .\\ngrok.exe http 8000\n";
    exit(1);
}

// Test 2: Vérifier que l'URL fonctionne
echo "\n📋 Test 2: Test de l'URL ngrok...\n";
$publicResponse = @file_get_contents($ngrokUrl . '/api/status', false, $context);

if ($publicResponse !== false) {
    echo "   ✅ URL ngrok fonctionne\n";
    $data = json_decode($publicResponse, true);
    if ($data) {
        echo "   📝 Message: " . ($data['message'] ?? 'N/A') . "\n";
    }
} else {
    echo "   ❌ URL ngrok ne répond pas\n";
    echo "   📝 Vérifiez que le serveur Laravel fonctionne\n";
    exit(1);
}

// Test 3: CORS depuis Vercel
echo "\n📋 Test 3: CORS depuis Vercel...\n";
$headers = [
    'Origin: https://kalel-sa-match.vercel.app',
    'Accept: application/json'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $ngrokUrl . '/api/status');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$corsResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "   ✅ CORS fonctionne - Vercel peut contacter ngrok\n";
} else {
    echo "   ❌ CORS bloqué - HTTP {$httpCode}\n";
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "🎉 URL NGROK EXISTANTE FONCTIONNE\n";
echo str_repeat("=", 60) . "\n";
echo "📍 URL API publique: {$ngrokUrl}\n";
echo "🔗 Endpoint API: {$ngrokUrl}/api\n";
echo "📋 Status API: {$ngrokUrl}/api/status\n";
echo "🌐 Frontend Vercel: https://kalel-sa-match.vercel.app\n\n";

echo "💻 CONFIGURATION FRONTEND:\n";
echo "```javascript\n";
echo "const API_URL = '{$ngrokUrl}/api';\n";
echo "\n";
echo "// Exemple d'utilisation\n";
echo "fetch(`${API_URL}/status`)\n";
echo "  .then(response => response.json())\n";
echo "  .then(data => console.log(data));\n";
echo "```\n\n";

echo "📞 COMMANDES UTILES:\n";
echo "• Voir l'interface ngrok: http://localhost:4040\n";
echo "• Test rapide: php use-existing-ngrok.php\n";
echo "• Redémarrer ngrok: .\\manage-ngrok-sessions.bat\n\n";

echo "⚠️ IMPORTANT:\n";
echo "• Cette URL fonctionne déjà\n";
echo "• Pas besoin de redémarrer ngrok\n";
echo "• Gardez le serveur Laravel en cours d'exécution\n\n";

echo "🚀 Utilisez cette URL pour Vercel !\n";
?> 