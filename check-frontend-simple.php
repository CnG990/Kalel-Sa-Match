<?php
echo "🔍 VÉRIFICATION FRONTEND VERCEL\n";
echo "===============================\n\n";

$vercelUrl = 'https://kalel-sa-match.vercel.app';
$ngrokUrl = 'https://ad07ffba09ee.ngrok-free.app';

echo "📋 Test 1: Frontend Vercel...\n";
$context = stream_context_create(['http' => ['timeout' => 10]]);
$response = @file_get_contents($vercelUrl, false, $context);

if ($response !== false) {
    echo "   ✅ Frontend Vercel accessible\n";
    echo "   📍 URL: {$vercelUrl}\n";
} else {
    echo "   ❌ Frontend Vercel inaccessible\n";
    echo "   📝 Vérifiez: {$vercelUrl}\n";
}

echo "\n📋 Test 2: API depuis Vercel...\n";
$headers = [
    'Origin: ' . $vercelUrl,
    'Accept: application/json'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $ngrokUrl . '/api/status');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$apiResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "   ✅ API accessible depuis Vercel\n";
    $data = json_decode($apiResponse, true);
    if ($data) {
        echo "   📝 Message: " . ($data['message'] ?? 'N/A') . "\n";
    }
} else {
    echo "   ❌ API inaccessible - HTTP {$httpCode}\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "🎯 CONFIGURATION FRONTEND\n";
echo str_repeat("=", 50) . "\n";
echo "📍 Frontend: {$vercelUrl}\n";
echo "🔗 API: {$ngrokUrl}/api\n\n";

echo "💻 CODE À AJOUTER DANS VERCEL:\n";
echo "```javascript\n";
echo "const API_URL = '{$ngrokUrl}/api';\n";
echo "```\n\n";

echo "✅ Tout est prêt pour la configuration !\n";
?> 