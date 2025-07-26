<?php
/**
 * Script de diagnostic pour le backend Laravel
 */

echo "🔍 DIAGNOSTIC BACKEND LARAVEL\n";
echo "==============================\n\n";

// Changer vers le répertoire Backend
if (!is_dir('Backend')) {
    echo "❌ Dossier Backend non trouvé\n";
    exit(1);
}

chdir('Backend');
echo "📍 Répertoire Backend: " . getcwd() . "\n\n";

// 1. Vérifier PHP
echo "1. Vérification de PHP...\n";
echo "   Version PHP: " . phpversion() . "\n";
echo "   Extensions requises:\n";
$requiredExtensions = ['curl', 'json', 'mbstring', 'openssl', 'pdo', 'pdo_pgsql'];
foreach ($requiredExtensions as $ext) {
    $status = extension_loaded($ext) ? '✅' : '❌';
    echo "   {$status} {$ext}\n";
}

// 2. Vérifier le répertoire
echo "\n2. Vérification du répertoire...\n";
$currentDir = getcwd();
echo "   Répertoire actuel: {$currentDir}\n";

// 3. Vérifier les fichiers Laravel
echo "\n3. Vérification des fichiers Laravel...\n";
$laravelFiles = [
    'artisan',
    'composer.json',
    '.env',
    'bootstrap/app.php',
    'config/app.php'
];

foreach ($laravelFiles as $file) {
    $status = file_exists($file) ? '✅' : '❌';
    echo "   {$status} {$file}\n";
}

// 4. Vérifier les permissions
echo "\n4. Vérification des permissions...\n";
$writableDirs = [
    'storage',
    'storage/logs',
    'storage/framework',
    'storage/framework/cache',
    'storage/framework/sessions',
    'storage/framework/views',
    'bootstrap/cache'
];

foreach ($writableDirs as $dir) {
    if (is_dir($dir)) {
        $status = is_writable($dir) ? '✅' : '❌';
        echo "   {$status} {$dir} (écriture)\n";
    } else {
        echo "   ❌ {$dir} (n'existe pas)\n";
    }
}

// 5. Vérifier la configuration de base de données
echo "\n5. Vérification de la configuration DB...\n";
if (file_exists('.env')) {
    $envContent = file_get_contents('.env');
    $dbConfig = [
        'DB_CONNECTION' => false,
        'DB_HOST' => false,
        'DB_PORT' => false,
        'DB_DATABASE' => false,
        'DB_USERNAME' => false,
        'DB_PASSWORD' => false
    ];
    
    foreach ($dbConfig as $key => &$value) {
        $value = strpos($envContent, $key) !== false;
    }
    
    foreach ($dbConfig as $key => $value) {
        $status = $value ? '✅' : '❌';
        echo "   {$status} {$key}\n";
    }
} else {
    echo "   ❌ Fichier .env manquant\n";
}

// 6. Test de démarrage du serveur
echo "\n6. Test de démarrage du serveur...\n";
echo "   Tentative de démarrage sur le port 8000...\n";

// Créer un script temporaire pour tester le serveur
$testScript = '<?php
require_once "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
echo "Laravel initialisé avec succès\n";
?>';

file_put_contents('test-laravel.php', $testScript);

$output = shell_exec('php test-laravel.php 2>&1');
if ($output && strpos($output, 'Laravel initialisé') !== false) {
    echo "   ✅ Laravel peut être initialisé\n";
} else {
    echo "   ❌ Erreur lors de l\'initialisation de Laravel\n";
    echo "   📝 Erreur: " . ($output ?: 'Aucune sortie') . "\n";
}

// Nettoyer
unlink('test-laravel.php');

// 7. Test de démarrage du serveur
echo "\n7. Test de démarrage du serveur...\n";
echo "   Commande: php artisan serve --host=127.0.0.1 --port=8000\n";
echo "   ⏳ Démarrage en cours...\n";

// Démarrer le serveur en arrière-plan
$command = 'php artisan serve --host=127.0.0.1 --port=8000 > server.log 2>&1 &';
shell_exec($command);

// Attendre un peu
sleep(3);

// Tester si le serveur répond
$context = stream_context_create(['http' => ['timeout' => 5]]);
$response = @file_get_contents('http://127.0.0.1:8000/api/status', false, $context);

if ($response !== false) {
    echo "   ✅ Serveur démarré et répond\n";
    echo "   📝 Réponse: " . substr($response, 0, 100) . "...\n";
} else {
    echo "   ❌ Serveur ne répond pas\n";
    echo "   📝 Vérifiez les logs: server.log\n";
}

echo "\n🎯 RECOMMANDATIONS:\n";
echo "1. Si des extensions PHP manquent: Installez-les\n";
echo "2. Si des fichiers Laravel manquent: Vérifiez l'installation\n";
echo "3. Si les permissions sont incorrectes: chmod 755 storage bootstrap/cache\n";
echo "4. Si la DB n'est pas configurée: Vérifiez le fichier .env\n";
echo "5. Pour démarrer le serveur: php artisan serve --host=127.0.0.1 --port=8000\n";

echo "\n📞 COMMANDES UTILES:\n";
echo "• php artisan serve --host=127.0.0.1 --port=8000\n";
echo "• php artisan migrate\n";
echo "• php artisan config:cache\n";
echo "• php artisan route:cache\n";
echo "• curl http://127.0.0.1:8000/api/status\n";
?> 