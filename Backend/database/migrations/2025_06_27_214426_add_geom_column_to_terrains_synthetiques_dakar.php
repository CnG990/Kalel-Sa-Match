<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            // 1. Activer l'extension PostGIS si pas déjà fait
            DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');
            echo "✅ Extension PostGIS activée\n";
            
            // 2. Vérifier si la colonne geom existe déjà
            $result = DB::select("SELECT column_name FROM information_schema.columns WHERE table_name = 'terrains_synthetiques_dakar' AND column_name = 'geom'");
            
            if (empty($result)) {
                // 3. Ajouter la colonne geom (POINT géométrique en SRID 4326 - WGS84)
                DB::statement('ALTER TABLE terrains_synthetiques_dakar ADD COLUMN geom geometry(POINT, 4326)');
                echo "✅ Colonne geom ajoutée avec succès\n";
                
                // 4. Créer un index spatial pour optimiser les requêtes géographiques
                DB::statement('CREATE INDEX IF NOT EXISTS idx_terrains_geom ON terrains_synthetiques_dakar USING GIST (geom)');
                echo "✅ Index spatial créé\n";
                
                // 5. Remplir les géométries avec les coordonnées latitude/longitude existantes
                DB::statement('
                    UPDATE terrains_synthetiques_dakar 
                    SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) 
                    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
                ');
                echo "✅ Géométries générées à partir des coordonnées\n";
            } else {
                echo "✅ Colonne geom existe déjà\n";
                
                // Mettre à jour les géométries pour les enregistrements qui n'en ont pas
                DB::statement('
                    UPDATE terrains_synthetiques_dakar 
                    SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) 
                    WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND geom IS NULL
                ');
                echo "✅ Géométries mises à jour\n";
            }
            
            // 6. Vérifier le résultat final
            $count = DB::selectOne('SELECT COUNT(*) as count FROM terrains_synthetiques_dakar WHERE geom IS NOT NULL');
            echo "📍 {$count->count} terrains avec géométrie PostGIS\n";
            
        } catch (\Exception $e) {
            echo "❌ Erreur lors de l'ajout de la colonne geom: " . $e->getMessage() . "\n";
            throw $e;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            // Supprimer l'index spatial
            DB::statement('DROP INDEX IF EXISTS idx_terrains_geom');
            
            // Supprimer la colonne geom
            DB::statement('ALTER TABLE terrains_synthetiques_dakar DROP COLUMN IF EXISTS geom');
            
            echo "✅ Colonne geom et index supprimés\n";
            
        } catch (\Exception $e) {
            echo "❌ Erreur lors de la suppression: " . $e->getMessage() . "\n";
        }
    }
};
