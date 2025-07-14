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
        Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
            // Permettre NULL pour les colonnes image_principale, images_supplementaires et surface
            $table->string('image_principale')->nullable()->change();
            $table->json('images_supplementaires')->nullable()->change();
            $table->decimal('surface', 10, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
            // Remettre les contraintes NOT NULL (attention: nécessite que les données soient non-null)
            $table->string('image_principale')->nullable(false)->change();
            $table->json('images_supplementaires')->nullable(false)->change();
            $table->decimal('surface', 10, 2)->nullable(false)->change();
        });
    }
};
