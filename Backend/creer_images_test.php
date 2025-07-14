<?php

echo "=== CRÉATION D'IMAGES DE TEST ===\n\n";

// Créer le dossier s'il n'existe pas
$imagesDir = storage_path('app/public/terrains/images');
if (!is_dir($imagesDir)) {
    mkdir($imagesDir, 0755, true);
    echo "✅ Dossier créé: $imagesDir\n";
} else {
    echo "✅ Dossier existe: $imagesDir\n";
}

// Créer une image de test simple (1x1 pixel PNG transparent)
$imageTestPath = $imagesDir . '/test-terrain.png';
if (!file_exists($imageTestPath)) {
    // Créer une image de test simple
    $imageData = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
    file_put_contents($imageTestPath, $imageData);
    echo "✅ Image de test créée: test-terrain.png\n";
} else {
    echo "✅ Image de test existe déjà\n";
}

// Vérifier les permissions
$permissions = substr(sprintf('%o', fileperms($imagesDir)), -4);
echo "📁 Permissions du dossier: $permissions\n";

// Lister les fichiers dans le dossier
echo "\n📋 FICHIERS DANS LE DOSSIER:\n";
$files = glob($imagesDir . '/*');
foreach ($files as $file) {
    $filename = basename($file);
    $size = filesize($file);
    echo "   - $filename (" . number_format($size) . " octets)\n";
}

echo "\n🔗 URLS DE TEST:\n";
echo "   - Image test: http://127.0.0.1:8000/storage/terrains/images/test-terrain.png\n";
echo "   - Via route web: http://127.0.0.1:8000/storage/terrains/images/test-terrain.png\n";

echo "\n📱 FRONTEND - Mise à jour nécessaire:\n";
echo "   - Vérifier que l'URL des images est correcte\n";
echo "   - Format: http://127.0.0.1:8000/storage/terrains/images/[filename]\n";

echo "\n✅ CRÉATION TERMINÉE !\n";
echo "=========================\n";

?> 