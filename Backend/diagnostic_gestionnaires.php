<?php

require_once 'vendor/autoload.php';

// Charger l'environnement Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\TerrainSynthetiquesDakar;
use App\Models\User;

echo "🔍 Diagnostic Terrains et Gestionnaires\n";
echo "======================================\n\n";

// 1. Vérifier la structure de la table terrains
echo "1. Structure table terrains_synthetiques_dakar :\n";
try {
    $columns = DB::select("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'terrains_synthetiques_dakar' ORDER BY ordinal_position");
    foreach($columns as $col) {
        echo "   - {$col->column_name} ({$col->data_type}) " . ($col->is_nullable === 'YES' ? 'NULL' : 'NOT NULL') . "\n";
    }
} catch(\Exception $e) {
    echo "   ❌ Erreur: " . $e->getMessage() . "\n";
}

// 2. Compter les gestionnaires
echo "\n2. Gestionnaires disponibles :\n";
$gestionnaires = User::where('role', 'gestionnaire')->get(['id', 'nom', 'prenom', 'email']);
echo "   Total: " . $gestionnaires->count() . " gestionnaires\n";
foreach($gestionnaires as $g) {
    echo "   - ID:{$g->id} {$g->prenom} {$g->nom} ({$g->email})\n";
}

// 3. Compter les terrains
echo "\n3. État des terrains :\n";
$totalTerrains = TerrainSynthetiquesDakar::count();
$terrainsAvecGestionnaire = TerrainSynthetiquesDakar::whereNotNull('gestionnaire_id')->count();
$terrainsSansGestionnaire = $totalTerrains - $terrainsAvecGestionnaire;

echo "   Total terrains: {$totalTerrains}\n";
echo "   Avec gestionnaire: {$terrainsAvecGestionnaire}\n";
echo "   Sans gestionnaire: {$terrainsSansGestionnaire}\n";

// 4. Test de l'API getAllTerrains
echo "\n4. Test API getAllTerrains :\n";
try {
    $apiTerrains = DB::table('terrains_synthetiques_dakar as t')
        ->leftJoin('users as g', 't.gestionnaire_id', '=', 'g.id')
        ->select([
            't.id',
            't.nom',
            't.gestionnaire_id',
            'g.nom as gestionnaire_nom',
            'g.prenom as gestionnaire_prenom',
            'g.email as gestionnaire_email'
        ])
        ->get();
        
    echo "   Requête réussie: " . $apiTerrains->count() . " terrains récupérés\n";
    
    foreach($apiTerrains as $terrain) {
        $status = $terrain->gestionnaire_id ? "✅ {$terrain->gestionnaire_prenom} {$terrain->gestionnaire_nom}" : "❌ Aucun";
        echo "   - {$terrain->nom} → Gestionnaire: {$status}\n";
    }
    
} catch(\Exception $e) {
    echo "   ❌ Erreur API: " . $e->getMessage() . "\n";
}

// 5. Vérifier les données corrompues
echo "\n5. Vérification intégrité des données :\n";
try {
    $terrainsCorrompu = DB::table('terrains_synthetiques_dakar')
        ->whereNull('nom')
        ->orWhereNull('id')
        ->count();
    echo "   Terrains avec données manquantes: {$terrainsCorrompu}\n";
    
    $gestionnaireInvalides = DB::table('terrains_synthetiques_dakar')
        ->whereNotNull('gestionnaire_id')
        ->whereNotIn('gestionnaire_id', User::where('role', 'gestionnaire')->pluck('id'))
        ->count();
    echo "   Terrains avec gestionnaire_id invalide: {$gestionnaireInvalides}\n";
    
} catch(\Exception $e) {
    echo "   ❌ Erreur vérification: " . $e->getMessage() . "\n";
}

// 6. Suggestions de correction
echo "\n6. Recommandations :\n";
if ($terrainsSansGestionnaire > 0) {
    echo "   💡 {$terrainsSansGestionnaire} terrain(s) à attribuer\n";
}
if ($gestionnaires->count() === 0) {
    echo "   ⚠️ Aucun gestionnaire disponible - créer des comptes gestionnaire\n";
}
if ($totalTerrains === 0) {
    echo "   ⚠️ Aucun terrain en base - vérifier l'import KML\n";
}

echo "\n✅ Diagnostic terminé !\n"; 