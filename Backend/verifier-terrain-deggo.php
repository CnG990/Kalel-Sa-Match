<?php
require_once 'vendor/autoload.php';

echo "=== Vérification Terrain Deggo ===\n";

try {
    // Charger Laravel
    $app = require_once 'bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    
    // Vérifier le terrain principal (TerrainSynthetiquesDakar)
    $terrainPrincipal = \App\Models\TerrainSynthetiquesDakar::find(6);
    
    if ($terrainPrincipal) {
        echo "📍 TERRAIN PRINCIPAL (TerrainSynthetiquesDakar):\n";
        echo "- ID: " . $terrainPrincipal->id . "\n";
        echo "- Nom: " . $terrainPrincipal->nom . "\n";
        echo "- Est actif: " . ($terrainPrincipal->est_actif ? 'OUI' : 'NON') . "\n";
        echo "- Gestionnaire ID: " . ($terrainPrincipal->gestionnaire_id ?? 'NULL') . "\n";
        
        // Vérifier les sous-terrains
        $sousTerrains = \App\Models\Terrain::where('terrain_synthetique_id', 6)->get();
        
        echo "\n🏈 SOUS-TERRAINS (Terrain):\n";
        echo "- Nombre de sous-terrains: " . $sousTerrains->count() . "\n";
        
        foreach ($sousTerrains as $sousTerrain) {
            echo "  * ID: " . $sousTerrain->id . "\n";
            echo "    Nom: " . $sousTerrain->nom . "\n";
            echo "    Disponible: " . ($sousTerrain->est_disponible ? 'OUI' : 'NON') . "\n";
            echo "    Gestionnaire ID: " . ($sousTerrain->gestionnaire_id ?? 'NULL') . "\n";
            echo "    Statut validation: " . ($sousTerrain->statut_validation ?? 'NULL') . "\n";
            echo "    ---\n";
        }
        
        // Vérifier les réservations récentes
        $reservations = \App\Models\Reservation::whereIn('terrain_id', $sousTerrains->pluck('id'))
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        echo "\n📅 RÉSERVATIONS RÉCENTES (7 derniers jours):\n";
        echo "- Nombre: " . $reservations->count() . "\n";
        
        foreach ($reservations as $reservation) {
            echo "  * ID: " . $reservation->id . "\n";
            echo "    Date: " . $reservation->date_debut . "\n";
            echo "    Statut: " . $reservation->statut . "\n";
            echo "    ---\n";
        }
        
    } else {
        echo "❌ Terrain Deggo (ID: 6) non trouvé dans TerrainSynthetiquesDakar\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Fin de vérification ===\n";
?> 