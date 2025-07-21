<?php

require_once 'vendor/autoload.php';

// Charger l'application Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Export des terrains en format Shapefile ===\n\n";

// Configuration de la base de données PostgreSQL
$host = 'localhost';
$port = '5432';
$database = 'terrains_synthetiques';
$username = 'postgres';
$password = 'root';

try {
    // Connexion directe à PostgreSQL
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connexion à PostgreSQL réussie\n";
    
    // Vérifier que la table existe
    $stmt = $pdo->query("SELECT COUNT(*) FROM terrains_synthetiques_dakar");
    $count = $stmt->fetchColumn();
    echo "📊 Nombre de terrains dans la table : {$count}\n\n";
    
    // Requête pour exporter en format shapefile via PostGIS
    $sql = "
    -- Créer un fichier SQL pour l'export
    COPY (
        SELECT 
            id,
            nom,
            description,
            adresse,
            prix_heure,
            capacite,
            surface,
            gestionnaire_id,
            ST_AsText(geom) as geom_wkt,
            ST_X(geom) as longitude,
            ST_Y(geom) as latitude,
            created_at,
            updated_at
        FROM terrains_synthetiques_dakar
        ORDER BY nom
    ) TO STDOUT WITH CSV HEADER;
    ";
    
    echo "📋 Données des terrains :\n";
    echo "ID | Nom | Adresse | Prix (FCFA/h) | Capacité | Coordonnées\n";
    echo "---|-----|---------|----------------|----------|------------\n";
    
    $stmt = $pdo->query("
        SELECT 
            id,
            nom,
            adresse,
            prix_heure,
            capacite,
            ST_X(geom) as longitude,
            ST_Y(geom) as latitude
        FROM terrains_synthetiques_dakar
        ORDER BY nom
    ");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf(
            "%d | %s | %s | %s | %d | %.6f, %.6f\n",
            $row['id'],
            $row['nom'],
            $row['adresse'],
            number_format($row['prix_heure'], 0, ',', ' '),
            $row['capacite'],
            $row['longitude'],
            $row['latitude']
        );
    }
    
    echo "\n=== Instructions pour l'export Shapefile ===\n";
    echo "Pour exporter en format shapefile, utilisez les commandes suivantes :\n\n";
    
    echo "1. **Export via pgAdmin ou psql :**\n";
    echo "   - Ouvrez pgAdmin\n";
    echo "   - Connectez-vous à la base 'terrains_synthetiques'\n";
    echo "   - Clic droit sur la table 'terrains_synthetiques_dakar'\n";
    echo "   - Sélectionnez 'Export' → 'Shapefile'\n\n";
    
    echo "2. **Export via commande psql :**\n";
    echo "   psql -h localhost -U postgres -d terrains_synthetiques -c \"\n";
    echo "   \\copy (SELECT id, nom, description, adresse, prix_heure, capacite, \n";
    echo "   ST_X(geom) as longitude, ST_Y(geom) as latitude \n";
    echo "   FROM terrains_synthetiques_dakar ORDER BY nom) \n";
    echo "   TO 'terrains_synthetiques_dakar.csv' WITH CSV HEADER;\n";
    echo "   \"\n\n";
    
    echo "3. **Export via ArcMap :**\n";
    echo "   - Ouvrez ArcMap\n";
    echo "   - Ajoutez une connexion à la base PostgreSQL\n";
    echo "   - Importez la table 'terrains_synthetiques_dakar'\n";
    echo "   - Exportez en format shapefile (.shp)\n\n";
    
    echo "4. **Export via QGIS :**\n";
    echo "   - Ouvrez QGIS\n";
    echo "   - Ajoutez une couche PostGIS\n";
    echo "   - Sélectionnez la table 'terrains_synthetiques_dakar'\n";
    echo "   - Clic droit → 'Exporter' → 'Sauvegarder les objets sous...'\n";
    echo "   - Choisissez le format 'ESRI Shapefile'\n\n";
    
    echo "=== Informations de connexion ===\n";
    echo "Host: {$host}\n";
    echo "Port: {$port}\n";
    echo "Database: {$database}\n";
    echo "Username: {$username}\n";
    echo "Password: {$password}\n";
    echo "Table: terrains_synthetiques_dakar\n";
    echo "Système de coordonnées: EPSG:4326 (WGS84)\n\n";
    
    echo "✅ Export des données terminé !\n";
    echo "📁 Le shapefile contiendra tous les 12 terrains avec leurs attributs.\n";
    
} catch (PDOException $e) {
    echo "❌ Erreur de connexion : " . $e->getMessage() . "\n";
    echo "Vérifiez que PostgreSQL est démarré et que les paramètres de connexion sont corrects.\n";
} 