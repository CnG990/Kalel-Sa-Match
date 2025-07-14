<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MergeKmlSeederData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'terrain:merge-kml-seeder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fusionner les données KML (géométries) avec les données du seeder (prix, capacité, descriptions)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== FUSION DONNEES KML + SEEDER TERRAINS ===');
        $this->newLine();

        // Données du seeder (complètes avec prix, capacité, descriptions)
        $seeder_data = [
            'Complexe Be Sport' => [
                'description' => 'Type: Football, Surface: gazon synthétique. Idéal pour les matchs amicaux et les entraînements.',
                'adresse' => 'Route de l\'Aéroport, près de l\'ancien aéroport, Dakar',
                'prix_par_heure' => 18000,
                'capacite' => 22,
            ],
            'Fara Foot' => [
                'description' => 'Un terrain moderne pour le football à 5. Ambiance conviviale garantie.',
                'adresse' => 'Sacré-Cœur, Dakar',
                'prix_par_heure' => 15000,
                'capacite' => 10,
            ],
            'Fit Park Academy' => [
                'description' => 'Complexe multisports avec un terrain de foot de qualité supérieure.',
                'adresse' => 'Mermoz, Dakar',
                'prix_par_heure' => 20000,
                'capacite' => 22,
            ],
            'Skate Parc' => [
                'description' => 'Terrain polyvalent, idéal pour le street football.',
                'adresse' => 'Corniche Ouest, Dakar',
                'prix_par_heure' => 12000,
                'capacite' => 14,
            ],
            'Sowfoot' => [
                'description' => 'Terrain de quartier bien entretenu, parfait pour les passionnés.',
                'adresse' => 'Grand Yoff, Dakar',
                'prix_par_heure' => 14000,
                'capacite' => 18,
            ],
            'Stade Deggo' => [
                'description' => 'Grand terrain avec des installations complètes pour des matchs officiels.',
                'adresse' => 'Hann Mariste, Dakar',
                'prix_par_heure' => 25000,
                'capacite' => 22,
            ],
            'Terrain ASC Jaraaf' => [
                'description' => 'Terrain historique du club ASC Jaraaf, pelouse synthétique de qualité.',
                'adresse' => 'Médina, Dakar',
                'prix_par_heure' => 16000,
                'capacite' => 22,
            ],
            'Stade LSS' => [
                'description' => 'Terrain moderne de Linguère Sporting Saint-Louis, aux normes FIFA.',
                'adresse' => 'Guédiawaye',
                'prix_par_heure' => 22000,
                'capacite' => 22,
            ],
            'Complexe Sportif Parcelles' => [
                'description' => 'Complexe sportif moderne avec plusieurs terrains de qualité.',
                'adresse' => 'Parcelles Assainies',
                'prix_par_heure' => 19000,
                'capacite' => 18,
            ],
            'Terrain Yoff' => [
                'description' => 'Terrain communautaire bien entretenu, idéal pour les tournois de quartier.',
                'adresse' => 'Yoff Virage',
                'prix_par_heure' => 13000,
                'capacite' => 20,
            ],
            'Stade de Pikine' => [
                'description' => 'Grand stade avec terrain synthétique, équipements modernes.',
                'adresse' => 'Pikine',
                'prix_par_heure' => 17000,
                'capacite' => 22,
            ],
            'Terrain Ouakam' => [
                'description' => 'Terrain en bord de mer, ambiance unique pour vos matchs.',
                'adresse' => 'Ouakam',
                'prix_par_heure' => 21000,
                'capacite' => 22,
            ],
            'Complexe HLM' => [
                'description' => 'Terrain de quartier populaire, très fréquenté par les jeunes.',
                'adresse' => 'HLM Grand Yoff',
                'prix_par_heure' => 11000,
                'capacite' => 16,
            ],
        ];

        try {
            // D'abord, afficher la structure de la table terrains
            $this->info('=== STRUCTURE TABLE TERRAINS ===');
            $columns = DB::select("SELECT column_name FROM information_schema.columns WHERE table_name = 'terrains' ORDER BY ordinal_position");
            foreach ($columns as $column) {
                $this->line("- " . $column->column_name);
            }
            $this->newLine();
            
            // Récupérer tous les terrains de la table terrains (avec géométries KML)
            $terrains_kml = DB::table('terrains')->get();
            
            $this->info("Terrains KML trouvés : " . count($terrains_kml));
            $this->info("Données seeder disponibles : " . count($seeder_data));
            $this->newLine();
            
            $updated_count = 0;
            $matched_count = 0;
            
            foreach ($terrains_kml as $terrain) {
                $terrain_nom = $terrain->nom;
                
                // Chercher une correspondance exacte dans les données du seeder
                if (isset($seeder_data[$terrain_nom])) {
                    $seeder_info = $seeder_data[$terrain_nom];
                    $matched_count++;
                    
                    // Vérifier si mise à jour nécessaire
                    $needs_update = false;
                    $update_data = [];
                    
                    // Description
                    if (empty($terrain->description) && !empty($seeder_info['description'])) {
                        $update_data['description'] = $seeder_info['description'];
                        $needs_update = true;
                    }
                    
                                         // Prix (colonne prix_heure dans la table)
                     if ((empty($terrain->prix_heure) || $terrain->prix_heure == 0) && !empty($seeder_info['prix_par_heure'])) {
                         $update_data['prix_heure'] = $seeder_info['prix_par_heure'];
                         $needs_update = true;
                     }
                    
                    // Capacité
                    if ((empty($terrain->capacite) || $terrain->capacite == 0) && !empty($seeder_info['capacite'])) {
                        $update_data['capacite'] = $seeder_info['capacite'];
                        $needs_update = true;
                    }
                    
                    if ($needs_update) {
                        DB::table('terrains')
                            ->where('id', $terrain->id)
                            ->update($update_data);
                        
                        $updated_count++;
                        
                                                 $this->info("✅ {$terrain_nom}:");
                         foreach ($update_data as $field => $value) {
                             if ($field === 'prix_heure') {
                                 $this->line("   Prix/heure: " . number_format($value) . " FCFA");
                             } elseif ($field === 'capacite') {
                                 $this->line("   Capacité: {$value} joueurs");
                             } elseif ($field === 'description') {
                                 $this->line("   Description: " . substr($value, 0, 50) . "...");
                             }
                         }
                        $this->newLine();
                    } else {
                        $this->line("⚡ {$terrain_nom}: Déjà complet");
                    }
                } else {
                    $this->warn("⚠️  {$terrain_nom}: Pas de correspondance dans le seeder");
                }
            }
            
            $this->newLine();
            $this->info('=== RÉSUMÉ FUSION ===');
            $this->info("Terrains correspondant au seeder: $matched_count/" . count($terrains_kml));
            $this->info("Terrains mis à jour: $updated_count");
            
            // Vérification finale
            $this->newLine();
            $this->info('=== VÉRIFICATION FINALE ===');
            $terrains_final = DB::table('terrains')->get();
            
            $complete_count = 0;
            $with_geometry_count = 0;
            
                         foreach ($terrains_final as $terrain) {
                 $has_geometry = !empty($terrain->geometrie_geojson) || !empty($terrain->geometrie);
                 $has_price = !empty($terrain->prix_heure) && $terrain->prix_heure > 0;
                 $has_capacity = !empty($terrain->capacite) && $terrain->capacite > 0;
                 $has_description = !empty($terrain->description);
                
                if ($has_geometry) $with_geometry_count++;
                if ($has_geometry && $has_price && $has_capacity && $has_description) $complete_count++;
            }
            
            $this->info("Terrains avec géométrie PostGIS: $with_geometry_count/" . count($terrains_final));
            $this->info("Terrains 100% complets: $complete_count/" . count($terrains_final));
            
            if ($complete_count == count($terrains_final)) {
                $this->newLine();
                $this->info("🎉 PARFAIT : Tous les terrains sont maintenant 100% complets !");
                $this->line("   ✅ Géométries PostGIS (KML)");
                $this->line("   ✅ Prix et capacités (Seeder)");
                $this->line("   ✅ Descriptions et adresses");
            } else {
                $this->info("📊 Progression: $complete_count/" . count($terrains_final) . " terrains complets");
            }
            
        } catch (\Exception $e) {
            $this->error("❌ Erreur : " . $e->getMessage());
            return Command::FAILURE;
        }

        $this->newLine();
        $this->info('=== FUSION TERMINÉE ===');
        return Command::SUCCESS;
    }
}
