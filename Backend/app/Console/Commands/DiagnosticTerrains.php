<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class DiagnosticTerrains extends Command
{
    protected $signature = 'diagnostic:terrains';
    protected $description = 'Diagnostiquer les terrains dans la BDD et l\'API';

    public function handle()
    {
        $this->info('🔍 DIAGNOSTIC API TERRAINS');
        $this->info('==========================');

        try {
            // Vérifier la table terrains_synthetiques_dakar
            $this->info('📊 Terrains dans terrains_synthetiques_dakar:');
            $terrains = DB::table('terrains_synthetiques_dakar')->get();
            
            $this->info("📈 Total: " . count($terrains) . " terrains\n");
            
            $terrainsWithCoords = 0;
            $terrainsWithoutCoords = 0;
            
            foreach ($terrains as $i => $terrain) {
                $hasCoords = !empty($terrain->latitude) && !empty($terrain->longitude) && 
                           $terrain->latitude != 0 && $terrain->longitude != 0;
                
                if ($hasCoords) {
                    $terrainsWithCoords++;
                    $this->line(sprintf("✅ %d. %s (lat: %s, lng: %s)", 
                        $i + 1, 
                        $terrain->nom, 
                        $terrain->latitude, 
                        $terrain->longitude
                    ));
                } else {
                    $terrainsWithoutCoords++;
                    $this->error(sprintf("❌ %d. %s (lat: %s, lng: %s) - COORDONNÉES MANQUANTES", 
                        $i + 1, 
                        $terrain->nom, 
                        $terrain->latitude ?? 'NULL', 
                        $terrain->longitude ?? 'NULL'
                    ));
                }
            }
            
            $this->info("\n📊 RÉSUMÉ:");
            $this->info("✅ Terrains avec coordonnées: $terrainsWithCoords");
            $this->error("❌ Terrains sans coordonnées: $terrainsWithoutCoords");
            $this->info("📈 Total dans BDD: " . count($terrains));

            // Tester l'API
            $this->info("\n🌐 Test de l'API:");
            try {
                $response = Http::timeout(10)->get('http://127.0.0.1:8000/api/terrains');
                
                if ($response->successful()) {
                    $data = $response->json();
                    
                    if ($data && $data['success'] && isset($data['data'])) {
                        $apiTerrains = is_array($data['data']) ? $data['data'] : ($data['data']['data'] ?? []);
                        $this->info("✅ API répond: " . count($apiTerrains) . " terrains");
                        
                        // Comparer avec la BDD
                        $bddIds = $terrains->pluck('id')->toArray();
                        $apiIds = collect($apiTerrains)->pluck('id')->toArray();
                        
                        $missingInApi = array_diff($bddIds, $apiIds);
                        $extraInApi = array_diff($apiIds, $bddIds);
                        
                        if (!empty($missingInApi)) {
                            $this->error("\n❌ Terrains manquants dans l'API:");
                            foreach ($missingInApi as $missingId) {
                                $terrain = $terrains->firstWhere('id', $missingId);
                                $this->error("  - ID $missingId: {$terrain->nom}");
                            }
                        }
                        
                        if (!empty($extraInApi)) {
                            $this->warn("\n⚠️ Terrains en trop dans l'API:");
                            foreach ($extraInApi as $extraId) {
                                $this->warn("  - ID $extraId");
                            }
                        }
                        
                        if (empty($missingInApi) && empty($extraInApi)) {
                            $this->info("✅ L'API retourne tous les terrains de la BDD");
                        }
                        
                    } else {
                        $this->error("❌ Format de réponse API invalide");
                    }
                } else {
                    $this->error("❌ API inaccessible (HTTP " . $response->status() . ")");
                }
            } catch (\Exception $e) {
                $this->error("❌ Erreur API: " . $e->getMessage());
            }

        } catch (\Exception $e) {
            $this->error("❌ Erreur: " . $e->getMessage());
        }

        $this->info("\n✅ Diagnostic terminé.");
        return 0;
    }
} 