<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('terrains_synthetiques_dakar', 'latitude')) {
            Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
                $table->decimal('latitude', 10, 8)->nullable()->comment('Latitude GPS du terrain');
            });
        }
        if (!Schema::hasColumn('terrains_synthetiques_dakar', 'longitude')) {
            Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
                $table->decimal('longitude', 11, 8)->nullable()->comment('Longitude GPS du terrain');
            });
        }
        // Index pour optimiser les requêtes géospatiales
        Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
            $table->index(['latitude', 'longitude'], 'terrains_gps_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
            // Supprimer l'index d'abord
            $table->dropIndex('terrains_gps_index');
            // Supprimer les colonnes si elles existent
            if (Schema::hasColumn('terrains_synthetiques_dakar', 'latitude')) {
                $table->dropColumn('latitude');
            }
            if (Schema::hasColumn('terrains_synthetiques_dakar', 'longitude')) {
                $table->dropColumn('longitude');
            }
        });
    }
};
