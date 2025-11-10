<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('contrats_commission')) {
            Schema::create('contrats_commission', function (Blueprint $table) {
                $table->id();
                $table->foreignId('gestionnaire_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('terrain_synthetique_id')->nullable()->constrained('terrains_synthetiques_dakar')->nullOnDelete();
                $table->decimal('taux_commission', 5, 2);
                $table->enum('type_contrat', ['global', 'par_terrain'])->default('global');
                $table->date('date_debut');
                $table->date('date_fin')->nullable();
                $table->enum('statut', ['actif','suspendu','expire','annule'])->default('actif');
                $table->text('conditions_speciales')->nullable();
                $table->json('historique_negociation')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('contrats_commission');
    }
};





