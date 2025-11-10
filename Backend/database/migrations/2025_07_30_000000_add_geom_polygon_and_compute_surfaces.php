<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter la colonne geom_polygon si absente
        if (!Schema::hasColumn('terrains_synthetiques_dakar', 'geom_polygon')) {
            DB::statement('ALTER TABLE terrains_synthetiques_dakar ADD COLUMN geom_polygon geometry(POLYGON, 4326)');
        }

        // Créer l'index spatial GIST si manquant
        DB::statement('CREATE INDEX IF NOT EXISTS idx_terrains_geom_polygon ON terrains_synthetiques_dakar USING GIST (geom_polygon)');

        // Initialiser geom_polygon à partir du point geom si disponible (petit buffer) sinon à partir de lat/lng
        // On crée un carré de 10m autour du point pour disposer d'une surface cohérente.
        // 10m en degrés ~ 10 / 111320 ≈ 0.00009
        DB::statement("UPDATE terrains_synthetiques_dakar SET geom_polygon = 
            CASE 
              WHEN geom IS NOT NULL THEN 
                ST_Transform(
                  ST_Buffer(
                    ST_Transform(geom, 3857), 10
                  ), 4326
                )
              WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 
                ST_Transform(
                  ST_Buffer(
                    ST_Transform(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326), 3857), 10
                  ), 4326
                )
              ELSE geom_polygon
            END
          WHERE geom_polygon IS NULL");

        // Recalculer les surfaces (en m²) dans la colonne surface si elle existe
        if (Schema::hasColumn('terrains_synthetiques_dakar', 'surface')) {
            DB::statement("UPDATE terrains_synthetiques_dakar SET surface = 
              CASE WHEN geom_polygon IS NOT NULL 
                THEN ROUND(CAST(ST_Area(ST_Transform(geom_polygon, 32628)) AS numeric), 2)
                ELSE surface
              END");
        }
    }

    public function down(): void
    {
        // Supprimer l'index et la colonne (sans perdre les données existantes si déjà utilisées)
        DB::statement('DROP INDEX IF EXISTS idx_terrains_geom_polygon');
        DB::statement('ALTER TABLE terrains_synthetiques_dakar DROP COLUMN IF EXISTS geom_polygon');
    }
};





