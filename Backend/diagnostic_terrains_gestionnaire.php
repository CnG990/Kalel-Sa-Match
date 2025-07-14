<?php

require_once 'bootstrap/app.php';

use App\Models\User;
use App\Models\TerrainSynthetiquesDakar;
use Illuminate\Support\Facades\DB;

echo "=== DIAGNOSTIC TERRAINS GESTIONNAIRE ===\n\n";

// 1. Lister les gestionnaires
echo "1. 👤 GESTIONNAIRES DANS LE SYSTÈME:\n";
$gestionnaires = User::where('role', 'gestionnaire')->get();

foreach ($gestionnaires as $gestionnaire) {
    echo "   - ID: {$gestionnaire->id}, Nom: {$gestionnaire->prenom} {$gestionnaire->nom}, Email: {$gestionnaire->email}\n";
    echo "     Statut: {$gestionnaire->statut_validation}\n";
}
echo "\n";

// 2. Lister les terrains avec gestionnaires
echo "2. 🏟️ TERRAINS ET LEURS GESTIONNAIRES:\n";
$terrains = TerrainSynthetiquesDakar::with('gestionnaire')->get();

foreach ($terrains as $terrain) {
    echo "   - Terrain ID: {$terrain->id}, Nom: {$terrain->nom}\n";
    if ($terrain->gestionnaire_id) {
        $gestionnaire = $terrain->gestionnaire;
        if ($gestionnaire) {
            echo "     👤 Gestionnaire: {$gestionnaire->prenom} {$gestionnaire->nom} (ID: {$gestionnaire->id})\n";
        } else {
            echo "     ❌ Gestionnaire ID {$terrain->gestionnaire_id} introuvable\n";
        }
    } else {
        echo "     ❌ Aucun gestionnaire assigné\n";
    }
    echo "     Statut: {$terrain->statut_validation}, Actif: " . ($terrain->est_actif ? 'Oui' : 'Non') . "\n";
}
echo "\n";

// 3. Vérifier les terrains du gestionnaire avec ID 20 (exemple)
echo "3. 🔍 TERRAINS POUR GESTIONNAIRE ID 20:\n";
$terrainsGest20 = TerrainSynthetiquesDakar::where('gestionnaire_id', 20)->get();

if ($terrainsGest20->count() > 0) {
    foreach ($terrainsGest20 as $terrain) {
        echo "   ✅ Terrain ID: {$terrain->id}, Nom: {$terrain->nom}\n";
        echo "      Statut: {$terrain->statut_validation}, Actif: " . ($terrain->est_actif ? 'Oui' : 'Non') . "\n";
    }
} else {
    echo "   ❌ Aucun terrain trouvé pour le gestionnaire ID 20\n";
}
echo "\n";

// 4. Assigner le terrain ID 5 au gestionnaire ID 20 si nécessaire
echo "4. 🔧 CORRECTION TERRAIN ID 5:\n";
$terrain5 = TerrainSynthetiquesDakar::find(5);

if ($terrain5) {
    echo "   Terrain trouvé: {$terrain5->nom}\n";
    echo "   Gestionnaire actuel: " . ($terrain5->gestionnaire_id ?: 'Aucun') . "\n";
    
    if ($terrain5->gestionnaire_id !== 20) {
        echo "   🔄 Assignation au gestionnaire ID 20...\n";
        $terrain5->update([
            'gestionnaire_id' => 20,
            'statut_validation' => 'approuve',
            'est_actif' => true
        ]);
        echo "   ✅ Terrain ID 5 assigné au gestionnaire ID 20\n";
    } else {
        echo "   ✅ Terrain déjà assigné au gestionnaire ID 20\n";
    }
} else {
    echo "   ❌ Terrain ID 5 non trouvé\n";
}
echo "\n";

// 5. Créer un nouveau terrain pour le gestionnaire si nécessaire
echo "5. 🆕 CRÉATION TERRAIN POUR GESTIONNAIRE:\n";
$existingTerrain = TerrainSynthetiquesDakar::where('gestionnaire_id', 20)->where('nom', 'LIKE', '%Sowfoot%')->first();

if (!$existingTerrain) {
    echo "   Création d'un terrain de test pour le gestionnaire...\n";
    $nouveauTerrain = TerrainSynthetiquesDakar::create([
        'nom' => 'Sowfoot - Terrain Gestionnaire',
        'description' => 'Terrain de test pour le gestionnaire',
        'adresse' => 'Central Park Avenue Malick Sy × Khalil Sokhna Fall, Dakar',
        'latitude' => 14.6928,
        'longitude' => -17.4467,
        'prix_heure' => 30000,
        'capacite' => 18,
        'surface' => 3563.89,
        'gestionnaire_id' => 20,
        'statut_validation' => 'approuve',
        'est_actif' => true,
        'image_principale' => 'terrains/images/sowfoot-main.jpg',
        'images_supplementaires' => ['terrains/images/sowfoot-1.jpg', 'terrains/images/sowfoot-2.jpg'],
        'horaires_ouverture' => '08:00-03:00',
        'equipements' => 'Éclairage nocturne, Vestiaires, Douches, Parking',
        'contact_telephone' => '+221 77 123 45 67'
    ]);
    echo "   ✅ Nouveau terrain créé: ID {$nouveauTerrain->id}\n";
} else {
    echo "   ✅ Terrain Sowfoot existe déjà pour le gestionnaire\n";
}
echo "\n";

// 6. Résumé
echo "=== RÉSUMÉ ===\n";
echo "Gestionnaires total: " . $gestionnaires->count() . "\n";
echo "Terrains total: " . $terrains->count() . "\n";
echo "Terrains pour gestionnaire ID 20: " . TerrainSynthetiquesDakar::where('gestionnaire_id', 20)->count() . "\n";
echo "\n";

echo "🚀 DIAGNOSTIC TERMINÉ !\n";
echo "===================================\n";

?> 