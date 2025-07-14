<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompleteTerrainDataSeeder extends Seeder
{
    public function run()
    {
        echo "=== COMPLETION DES DONNEES MANQUANTES TERRAINS ===\n\n";

        // Récupérer tous les terrains
        $terrains = DB::table('terrains')->get();
        
        echo "Terrains trouvés : " . count($terrains) . "\n\n";
        
        // Données réalistes pour les terrains de Dakar
        $terrain_data = [
            // Terrains standards
            'standard' => [
                'prix_heure' => [15000, 20000, 25000, 18000, 22000], // Prix en FCFA
                'capacite' => [22, 24, 26, 20, 18] // Joueurs par match
            ],
            // Complexes sportifs
            'complexe' => [
                'prix_heure' => [25000, 30000, 35000, 28000, 32000],
                'capacite' => [22, 24, 26, 28, 30]
            ],
            // Stades
            'stade' => [
                'prix_heure' => [20000, 25000, 30000, 22000, 27000],
                'capacite' => [22, 24, 26, 30, 32]
            ]
        ];

        $updated_count = 0;
        
        foreach ($terrains as $terrain) {
            $needs_update = false;
            $update_data = [];
            
            // Vérifier si le prix manque (null, 0 ou vide)
            if (is_null($terrain->prix_par_heure) || $terrain->prix_par_heure == 0) {
                $needs_update = true;
                
                // Déterminer le type de terrain
                $nom_lower = strtolower($terrain->nom);
                if (strpos($nom_lower, 'complexe') !== false) {
                    $type = 'complexe';
                } elseif (strpos($nom_lower, 'stade') !== false) {
                    $type = 'stade';
                } else {
                    $type = 'standard';
                }
                
                // Assigner un prix aléatoire selon le type
                $prix_options = $terrain_data[$type]['prix_heure'];
                $update_data['prix_par_heure'] = $prix_options[array_rand($prix_options)];
            }
            
            // Vérifier si la capacité manque (null, 0 ou vide)
            if (is_null($terrain->capacite) || $terrain->capacite == 0) {
                $needs_update = true;
                
                // Déterminer le type de terrain pour la capacité
                $nom_lower = strtolower($terrain->nom);
                if (strpos($nom_lower, 'complexe') !== false) {
                    $type = 'complexe';
                } elseif (strpos($nom_lower, 'stade') !== false) {
                    $type = 'stade';
                } else {
                    $type = 'standard';
                }
                
                // Assigner une capacité selon le type
                $capacite_options = $terrain_data[$type]['capacite'];
                $update_data['capacite'] = $capacite_options[array_rand($capacite_options)];
            }
            
            // Mise à jour si nécessaire
            if ($needs_update) {
                DB::table('terrains')
                    ->where('id', $terrain->id)
                    ->update($update_data);
                
                $updated_count++;
                
                echo "✅ {$terrain->nom}:\n";
                if (isset($update_data['prix_par_heure'])) {
                    echo "   Prix/heure: " . number_format($update_data['prix_par_heure']) . " FCFA\n";
                }
                if (isset($update_data['capacite'])) {
                    echo "   Capacité: {$update_data['capacite']} joueurs\n";
                }
                echo "\n";
            } else {
                echo "⚡ {$terrain->nom}: Données déjà complètes\n";
            }
        }
        
        echo "\n=== RÉSUMÉ ===\n";
        echo "Terrains mis à jour : $updated_count/" . count($terrains) . "\n";
        
        // Vérification finale
        echo "\n=== VÉRIFICATION FINALE ===\n";
        $terrains_final = DB::table('terrains')->get();
        
        $complete_count = 0;
        foreach ($terrains_final as $terrain) {
            if (!is_null($terrain->prix_par_heure) && $terrain->prix_par_heure > 0 && 
                !is_null($terrain->capacite) && $terrain->capacite > 0) {
                $complete_count++;
            }
        }
        
        echo "Terrains avec données complètes : $complete_count/" . count($terrains_final) . "\n";
        
        if ($complete_count == count($terrains_final)) {
            echo "🎉 SUCCÈS : Tous les terrains ont maintenant des données complètes !\n";
        }
        
        echo "\n=== SCRIPT TERMINÉ ===\n";
    }
} 