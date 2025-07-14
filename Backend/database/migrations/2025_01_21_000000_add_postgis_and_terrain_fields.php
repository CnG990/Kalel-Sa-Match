<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Ajouter les colonnes manquantes à terrains_synthetiques_dakar
        Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
            $table->decimal('prix_heure', 10, 2)->default(15000)->after('longitude');
            $table->integer('capacite')->default(22)->after('prix_heure');
            $table->decimal('surface', 10, 2)->nullable()->after('capacite');
        });

        // Activer l'extension PostGIS si pas déjà fait
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');
        
        // Ajouter la colonne géométrie PostGIS
        DB::statement('ALTER TABLE terrains_synthetiques_dakar ADD COLUMN geom geometry(Polygon, 4326)');
        
        // Créer un index spatial pour optimiser les requêtes
        DB::statement('CREATE INDEX idx_terrains_geom ON terrains_synthetiques_dakar USING GIST (geom)');
        
        // Générer des géométries de démonstration basées sur les coordonnées existantes
        $this->generateDemoGeometries();
    }

    public function down()
    {
        Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
            $table->dropColumn(['prix_heure', 'capacite', 'surface']);
        });
        
        // Supprimer l'index et la colonne géométrie
        DB::statement('DROP INDEX IF EXISTS idx_terrains_geom');
        DB::statement('ALTER TABLE terrains_synthetiques_dakar DROP COLUMN IF EXISTS geom');
    }

    private function generateDemoGeometries()
    {
        // Récupérer tous les terrains avec leurs coordonnées
        $terrains = DB::table('terrains_synthetiques_dakar')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        foreach ($terrains as $terrain) {
            // Créer un rectangle de ~100m x 50m autour du point central
            $latOffset = 0.0004; // ~50m en latitude
            $lonOffset = 0.0009; // ~100m en longitude (dépend de la latitude)
            
            $lat = (float) $terrain->latitude;
            $lon = (float) $terrain->longitude;
            
            // Créer un polygone rectangulaire représentant le terrain
            $polygon = sprintf(
                'POLYGON((%f %f, %f %f, %f %f, %f %f, %f %f))',
                $lon - $lonOffset, $lat - $latOffset, // Bottom-left
                $lon + $lonOffset, $lat - $latOffset, // Bottom-right  
                $lon + $lonOffset, $lat + $latOffset, // Top-right
                $lon - $lonOffset, $lat + $latOffset, // Top-left
                $lon - $lonOffset, $lat - $latOffset  // Close polygon
            );
            
            // Insérer la géométrie
            DB::statement(
                "UPDATE terrains_synthetiques_dakar SET geom = ST_GeomFromText(?, 4326) WHERE id = ?",
                [$polygon, $terrain->id]
            );
        }
    }
}; 