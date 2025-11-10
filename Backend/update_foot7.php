<?php

/**
 * Script pour mettre à jour Foot7+
 * Usage: php update_foot7.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\TerrainSynthetiquesDakar;

echo "🔄 Mise à jour de Foot7+\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$foot7 = TerrainSynthetiquesDakar::where('nom', 'Foot7+')->first();

if ($foot7) {
    $foot7->prix_heure = 25000;
    $foot7->capacite = 16;
    $foot7->save();
    
    echo "✅ Foot7+ mis à jour avec succès !\n\n";
    echo "📊 Informations mises à jour:\n";
    echo "   - Nom: {$foot7->nom}\n";
    echo "   - Latitude: {$foot7->latitude}\n";
    echo "   - Longitude: {$foot7->longitude}\n";
    echo "   - Prix/heure: {$foot7->prix_heure} FCFA\n";
    echo "   - Capacité: {$foot7->capacite} joueurs (8v8)\n";
    echo "   - Adresse: {$foot7->adresse}\n";
} else {
    echo "❌ Foot7+ non trouvé dans la base de données\n";
}

echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "✅ Mise à jour terminée !\n";

