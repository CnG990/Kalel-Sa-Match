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
        // 1. Ajouter toutes les colonnes manquantes à terrains_synthetiques_dakar
        Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
            // Supprimer l'ancienne colonne geom si elle existe (elle est de type Polygon)
            try {
                DB::statement('ALTER TABLE terrains_synthetiques_dakar DROP COLUMN IF EXISTS geom');
            } catch (\Exception $e) {
                // Ignorer si la colonne n'existe pas
            }
            
            // Ajouter les colonnes manquantes si elles n'existent pas
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'prix_heure')) {
                $table->decimal('prix_heure', 10, 2)->nullable()->after('longitude');
            }
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'capacite')) {
                $table->integer('capacite')->default(22)->after('prix_heure');
            }
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'surface')) {
                $table->decimal('surface', 8, 2)->nullable()->after('capacite');
            }
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'gestionnaire_id')) {
                $table->foreignId('gestionnaire_id')->nullable()->constrained('users')->onDelete('set null')->after('surface');
            }
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'contact_telephone')) {
                $table->string('contact_telephone')->nullable()->after('gestionnaire_id');
            }
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'email_contact')) {
                $table->string('email_contact')->nullable()->after('contact_telephone');
            }
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'horaires_ouverture')) {
                $table->time('horaires_ouverture')->default('08:00')->after('email_contact');
            }
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'horaires_fermeture')) {
                $table->time('horaires_fermeture')->default('03:00')->after('horaires_ouverture');
            }
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'type_surface')) {
                $table->enum('type_surface', ['gazon_synthetique', 'beton', 'terre', 'sable'])->default('gazon_synthetique')->after('horaires_fermeture');
            }
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'equipements')) {
                $table->json('equipements')->nullable()->after('type_surface');
            }
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'regles_maison')) {
                $table->text('regles_maison')->nullable()->after('equipements');
            }
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'note_moyenne')) {
                $table->decimal('note_moyenne', 3, 2)->default(4.50)->after('regles_maison');
            }
            if (!Schema::hasColumn('terrains_synthetiques_dakar', 'nombre_avis')) {
                $table->integer('nombre_avis')->default(0)->after('note_moyenne');
            }
        });

        // 2. Ajouter la nouvelle colonne géométrie PostGIS avec le bon type (POINT)
        try {
            DB::statement('ALTER TABLE terrains_synthetiques_dakar ADD COLUMN geom geometry(POINT, 4326)');
        } catch (\Exception $e) {
            // Si la colonne existe déjà, on l'ignore
            echo "Colonne geom existe déjà ou erreur: " . $e->getMessage() . "\n";
        }

        // 3. Créer un index spatial sur la géométrie
        try {
            DB::statement('CREATE INDEX IF NOT EXISTS idx_terrains_geom ON terrains_synthetiques_dakar USING GIST (geom)');
        } catch (\Exception $e) {
            echo "Index spatial existe déjà ou erreur: " . $e->getMessage() . "\n";
        }

        // 4. Mettre à jour la géométrie avec les coordonnées existantes
        try {
            DB::statement("
                UPDATE terrains_synthetiques_dakar 
                SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
                WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND geom IS NULL
            ");
        } catch (\Exception $e) {
            echo "Erreur mise à jour géométrie: " . $e->getMessage() . "\n";
        }

        // 5. Modifier la table reservations pour pointer vers terrains_synthetiques_dakar
        if (Schema::hasTable('reservations')) {
            try {
                Schema::table('reservations', function (Blueprint $table) {
                    // Ajouter une nouvelle colonne pour terrain_synthetique_id
                    if (!Schema::hasColumn('reservations', 'terrain_synthetique_id')) {
                        $table->foreignId('terrain_synthetique_id')->nullable()->constrained('terrains_synthetiques_dakar')->onDelete('cascade')->after('terrain_id');
                    }
                });
            } catch (\Exception $e) {
                echo "Erreur ajout colonne terrain_synthetique_id: " . $e->getMessage() . "\n";
            }

            // Migrer les données existantes des réservations (si la table terrains existe)
            try {
                if (Schema::hasTable('terrains')) {
                    DB::statement("
                        UPDATE reservations r
                        SET terrain_synthetique_id = (
                            SELECT t.terrain_synthetique_id 
                            FROM terrains t 
                            WHERE t.id = r.terrain_id
                        )
                        WHERE terrain_synthetique_id IS NULL
                    ");
                }
            } catch (\Exception $e) {
                echo "Erreur migration données réservations: " . $e->getMessage() . "\n";
            }
        }

        echo "✅ Table terrains_synthetiques_dakar centralisée avec colonne geom\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer les colonnes ajoutées
        Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
            $table->dropColumn([
                'prix_heure', 'capacite', 'surface', 'gestionnaire_id', 
                'contact_telephone', 'email_contact', 'horaires_ouverture', 
                'horaires_fermeture', 'type_surface', 'equipements', 
                'regles_maison', 'note_moyenne', 'nombre_avis'
            ]);
        });

        // Supprimer la colonne géométrie
        DB::statement('ALTER TABLE terrains_synthetiques_dakar DROP COLUMN IF EXISTS geom');

        // Supprimer la colonne terrain_synthetique_id des réservations
        if (Schema::hasTable('reservations')) {
            Schema::table('reservations', function (Blueprint $table) {
                $table->dropForeign(['terrain_synthetique_id']);
                $table->dropColumn('terrain_synthetique_id');
            });
        }
    }
}; 