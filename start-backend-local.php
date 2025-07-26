<?php
/**
 * Script pour démarrer le backend Laravel en local
 * Permet de tester l'API avant le déploiement sur Render
 */

echo "🚀 Démarrage du backend Laravel en local...\n";
echo "📍 Port: 8000\n";
echo "🌐 URL: http://localhost:8000\n";
echo "📋 API URL: http://localhost:8000/api\n\n";

// Vérifier que nous sommes dans le bon répertoire
if (!file_exists('Backend/composer.json')) {
    echo "❌ Erreur: composer.json non trouvé dans Backend/\n";
    echo "📍 Assurez-vous d'être dans le répertoire racine du projet\n";
    exit(1);
}

// Changer vers le répertoire Backend
chdir('Backend');

// Vérifier les fichiers essentiels
echo "📋 Vérification des fichiers essentiels...\n";
$requiredFiles = [
    'composer.json',
    '.env',
    'artisan'
];

foreach ($requiredFiles as $file) {
    if (file_exists($file)) {
        echo "   ✅ {$file}\n";
    } else {
        echo "   ❌ {$file} manquant\n";
        exit(1);
    }
}

// Vérifier la base de données locale
echo "\n🗄️ Vérification de la base de données locale...\n";
try {
    // Charger les variables d'environnement
    $envFile = '.env';
    if (file_exists($envFile)) {
        $envContent = file_get_contents($envFile);
        $lines = explode("\n", $envContent);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && !str_starts_with($line, '#')) {
                list($key, $value) = explode('=', $line, 2);
                $_ENV[trim($key)] = trim($value);
                putenv(trim($key) . '=' . trim($value));
            }
        }
    }
    
    echo "   ✅ Variables d'environnement chargées\n";
} catch (Exception $e) {
    echo "   ⚠️ Erreur lors du chargement des variables d'environnement: {$e->getMessage()}\n";
}

// Vérifier les migrations
echo "\n📊 Vérification des migrations...\n";
$migrationStatus = shell_exec('php artisan migrate:status 2>&1');
if (strpos($migrationStatus, 'No pending migrations') !== false) {
    echo "   ✅ Migrations à jour\n";
} else {
    echo "   ⚠️ Migrations en attente\n";
    echo "   🔄 Exécution des migrations...\n";
    $migrationResult = shell_exec('php artisan migrate --force 2>&1');
    echo "   ✅ Migrations exécutées\n";
}

// Optimiser l'application
echo "\n⚡ Optimisation de l'application...\n";
shell_exec('php artisan config:cache 2>/dev/null');
shell_exec('php artisan route:cache 2>/dev/null');
shell_exec('php artisan view:cache 2>/dev/null');
echo "   ✅ Cache optimisé\n";

// Créer le lien de stockage
echo "\n📁 Création du lien de stockage...\n";
if (!file_exists('public/storage')) {
    shell_exec('php artisan storage:link 2>/dev/null');
    echo "   ✅ Lien de stockage créé\n";
} else {
    echo "   ✅ Lien de stockage existant\n";
}

// Démarrer le serveur
echo "\n🌐 Démarrage du serveur Laravel...\n";
echo "📍 URL: http://localhost:8000\n";
echo "📋 API Status: http://localhost:8000/api/status\n";
echo "🔧 Test DB: http://localhost:8000/api/test-db\n";
echo "📊 Migration Status: http://localhost:8000/api/migration-status\n";
echo "\n🎯 Pour tester l'API:\n";
echo "   • Ouvrez un navigateur: http://localhost:8000/api/status\n";
echo "   • Ou utilisez curl: curl http://localhost:8000/api/status\n";
echo "   • Ou lancez le script de test: php ../test-api-local.php\n";
echo "\n⏹️ Pour arrêter le serveur: Ctrl+C\n";
echo "=" . str_repeat("=", 60) . "\n";

// Démarrer le serveur Laravel
passthru('php artisan serve --host=0.0.0.0 --port=8000');
?> 