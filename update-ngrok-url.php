<?php

// Script pour mettre à jour automatiquement l'URL ngrok dans le frontend

echo "🔄 Mise à jour de l'URL ngrok...\n";

// Récupérer l'URL ngrok actuelle
$ngrokApi = "http://127.0.0.1:4040/api/tunnels";
$response = file_get_contents($ngrokApi);

if (!$response) {
    echo "❌ Impossible de récupérer l'URL ngrok\n";
    exit(1);
}

$data = json_decode($response, true);
if (!$data || !isset($data['tunnels'][0]['public_url'])) {
    echo "❌ Format de réponse ngrok invalide\n";
    exit(1);
}

$ngrokUrl = $data['tunnels'][0]['public_url'];
echo "✅ URL ngrok actuelle : $ngrokUrl\n";

// Fichiers à mettre à jour
$files = [
    'Frontend/kalel-sa-match/app/services/terrain.ts',
    'Frontend/src/pages/dashboard/MapPage.tsx',
    'Frontend/src/pages/dashboard/MapPageComplete.tsx',
    'Frontend/src/pages/dashboard/MapPageDebug.tsx'
];

$updatedCount = 0;

foreach ($files as $file) {
    if (!file_exists($file)) {
        echo "⚠️ Fichier non trouvé : $file\n";
        continue;
    }
    
    $content = file_get_contents($file);
    
    // Remplacer toutes les URLs ngrok par la nouvelle
    $pattern = '/https:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app/';
    $newContent = preg_replace($pattern, $ngrokUrl, $content);
    
    if ($newContent !== $content) {
        file_put_contents($file, $newContent);
        echo "✅ Mis à jour : $file\n";
        $updatedCount++;
    } else {
        echo "ℹ️ Aucun changement : $file\n";
    }
}

echo "\n🎉 Mise à jour terminée ! $updatedCount fichiers modifiés.\n";
echo "📝 URL ngrok actuelle : $ngrokUrl\n";
echo "🌐 Testez l'API : $ngrokUrl/api/terrains/all-for-map\n"; 