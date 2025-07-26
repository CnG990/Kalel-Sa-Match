<?php
// Test local de la configuration Laravel
echo "=== TEST CONFIGURATION LARAVEL ===\n";

// Vérifier si Laravel est accessible
if (file_exists('Backend/vendor/autoload.php')) {
    echo "✅ Autoloader Laravel trouvé\n";
} else {
    echo "❌ Autoloader Laravel manquant\n";
    exit(1);
}

// Charger Laravel
require_once 'Backend/vendor/autoload.php';
$app = require_once 'Backend/bootstrap/app.php';

try {
    // Test de la configuration
    echo "✅ Application Laravel chargée\n";
    
    // Test des variables d'environnement
    echo "\n=== VARIABLES D'ENVIRONNEMENT ===\n";
    echo "APP_NAME: " . env('APP_NAME', 'Non défini') . "\n";
    echo "APP_ENV: " . env('APP_ENV', 'Non défini') . "\n";
    echo "APP_DEBUG: " . env('APP_DEBUG', 'Non défini') . "\n";
    echo "DB_CONNECTION: " . env('DB_CONNECTION', 'Non défini') . "\n";
    echo "DB_HOST: " . env('DB_HOST', 'Non défini') . "\n";
    echo "DB_PORT: " . env('DB_PORT', 'Non défini') . "\n";
    echo "DB_DATABASE: " . env('DB_DATABASE', 'Non défini') . "\n";
    echo "DB_USERNAME: " . env('DB_USERNAME', 'Non défini') . "\n";
    echo "DB_PASSWORD: " . (env('DB_PASSWORD') ? 'Défini' : 'Non défini') . "\n";
    
    // Test de la connexion à la base de données
    echo "\n=== TEST CONNEXION BASE DE DONNÉES ===\n";
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    try {
        $pdo = DB::connection()->getPdo();
        echo "✅ Connexion à la base de données réussie\n";
        echo "Version PostgreSQL: " . $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . "\n";
    } catch (Exception $e) {
        echo "❌ Erreur de connexion à la base de données: " . $e->getMessage() . "\n";
    }
    
    // Test des routes
    echo "\n=== TEST ROUTES ===\n";
    $routes = Route::getRoutes();
    $apiRoutes = [];
    foreach ($routes as $route) {
        if (strpos($route->uri(), 'api/') === 0) {
            $apiRoutes[] = $route->uri();
        }
    }
    
    if (!empty($apiRoutes)) {
        echo "✅ Routes API trouvées:\n";
        foreach ($apiRoutes as $route) {
            echo "  - " . $route . "\n";
        }
    } else {
        echo "❌ Aucune route API trouvée\n";
    }
    
    // Test spécifique de la route /api/status
    echo "\n=== TEST ROUTE /API/STATUS ===\n";
    $statusRoute = null;
    foreach ($routes as $route) {
        if ($route->uri() === 'api/status') {
            $statusRoute = $route;
            break;
        }
    }
    
    if ($statusRoute) {
        echo "✅ Route /api/status trouvée\n";
        echo "Méthode: " . implode(',', $statusRoute->methods()) . "\n";
    } else {
        echo "❌ Route /api/status non trouvée\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur lors du test: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== TEST TERMINÉ ===\n";
?> 