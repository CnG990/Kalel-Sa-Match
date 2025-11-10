<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\TerrainSynthetiquesDakar;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 Attribution du gestionnaire au terrain Mini-Foot Auchan\n\n";

// 1. Trouver le gestionnaire de test
$gestionnaire = User::where('email', 'gestionnaire@test.com')->first();

if (!$gestionnaire) {
    echo "❌ Gestionnaire non trouvé avec l'email: gestionnaire@test.com\n";
    echo "💡 Créez d'abord le gestionnaire avec le DatabaseSeeder\n";
    exit(1);
}

echo "✅ Gestionnaire trouvé:\n";
echo "   - ID: {$gestionnaire->id}\n";
echo "   - Nom: {$gestionnaire->nom} {$gestionnaire->prenom}\n";
echo "   - Email: {$gestionnaire->email}\n";
echo "   - Téléphone: {$gestionnaire->telephone}\n";
echo "   - Rôle: {$gestionnaire->role}\n";
echo "   - Statut: {$gestionnaire->statut_validation}\n\n";

// 2. Trouver le terrain "Mini-Foot Auchan"
$terrain = TerrainSynthetiquesDakar::where('nom', 'Mini-Foot Auchan')->first();

if (!$terrain) {
    echo "❌ Terrain 'Mini-Foot Auchan' non trouvé dans la base de données\n";
    echo "💡 Assurez-vous que le terrain existe (exécutez les seeders si nécessaire)\n";
    exit(1);
}

echo "✅ Terrain trouvé:\n";
echo "   - ID: {$terrain->id}\n";
echo "   - Nom: {$terrain->nom}\n";
echo "   - Adresse: {$terrain->adresse}\n";
echo "   - Gestionnaire actuel: " . ($terrain->gestionnaire_id ? "ID {$terrain->gestionnaire_id}" : "Aucun") . "\n\n";

// 3. Attribuer le gestionnaire au terrain
try {
    $terrain->gestionnaire_id = $gestionnaire->id;
    $terrain->save();
    
    echo "✅ Attribution réussie!\n";
    echo "   Le terrain 'Mini-Foot Auchan' est maintenant géré par:\n";
    echo "   - {$gestionnaire->prenom} {$gestionnaire->nom} ({$gestionnaire->email})\n\n";
    
    // Vérification
    $terrain->refresh();
    $gestionnaireAttribue = $terrain->gestionnaire;
    
    if ($gestionnaireAttribue) {
        echo "✅ Vérification: Le gestionnaire est bien attribué\n";
        echo "   - Gestionnaire ID: {$terrain->gestionnaire_id}\n";
        echo "   - Nom: {$gestionnaireAttribue->prenom} {$gestionnaireAttribue->nom}\n";
    } else {
        echo "⚠️  Attention: La relation ne fonctionne pas correctement\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Erreur lors de l'attribution: {$e->getMessage()}\n";
    exit(1);
}

echo "\n✅ Opération terminée avec succès!\n";

