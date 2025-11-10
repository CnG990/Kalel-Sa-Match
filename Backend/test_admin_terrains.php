<?php

function request($method, $url, $headers = [], $body = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    if (!empty($headers)) curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, $resp];
}

echo "\n=== Test /api/admin/terrains ===\n";
list($code, $resp) = request('POST', 'http://127.0.0.1:8000/api/auth/login', [
    'Accept: application/json',
    'Content-Type: application/json'
], json_encode([
    'email' => 'admin@terrains-dakar.com',
    'password' => 'Admin123!',
    'device_name' => 'api-test'
]));

echo "Login HTTP: $code\n";
if ($code !== 200) {
    echo "Response: $resp\n";
    exit(1);
}
$data = json_decode($resp, true);
$token = $data['data']['token'] ?? null;
if (!$token) { echo "No token in response\n"; exit(1);} 

list($code2, $resp2) = request('GET', 'http://127.0.0.1:8000/api/admin/terrains', [
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

echo "Terrains HTTP: $code2\n";
echo "Body (first 500 chars):\n" . substr($resp2, 0, 500) . "\n";

$json = json_decode($resp2, true);
if ($json && isset($json['data'])) {
    if (isset($json['data']['data']) && is_array($json['data']['data'])) {
        echo "Count: " . count($json['data']['data']) . "\n";
    } elseif (is_array($json['data'])) {
        echo "Count: " . count($json['data']) . "\n";
    }
}



