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
        // Table pour les réductions de fidélité appliquées
        Schema::create('reductions_fidelite', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('terrain_id')->constrained('terrains_synthetiques_dakar')->onDelete('cascade');
            $table->string('type_abonnement');
            $table->decimal('prix_original', 10, 2);
            $table->integer('reduction_pourcentage');
            $table->decimal('montant_reduction', 10, 2);
            $table->decimal('prix_final', 10, 2);
            $table->string('niveau_fidelite');
            $table->timestamps();

            $table->index(['user_id', 'terrain_id']);
        });

        // Table pour l'historique des points de fidélité
        Schema::create('points_fidelite', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('terrain_id')->constrained('terrains_synthetiques_dakar')->onDelete('cascade');
            $table->string('action'); // 'reservation', 'abonnement', 'parrainage', etc.
            $table->integer('points_gagnes');
            $table->string('description');
            $table->json('metadata')->nullable(); // données supplémentaires
            $table->timestamps();

            $table->index(['user_id', 'terrain_id']);
        });

        // Table pour les niveaux de fidélité personnalisés par terrain
        Schema::create('niveaux_fidelite_terrain', function (Blueprint $table) {
            $table->id();
            $table->foreignId('terrain_id')->constrained('terrains_synthetiques_dakar')->onDelete('cascade');
            $table->string('niveau'); // 'Bronze', 'Argent', 'Or', 'Platine'
            $table->integer('points_requis');
            $table->integer('reduction_pourcentage');
            $table->json('avantages'); // liste des avantages spécifiques
            $table->string('couleur_badge')->default('#808080');
            $table->string('icone')->default('star');
            $table->boolean('est_actif')->default(true);
            $table->timestamps();

            $table->unique(['terrain_id', 'niveau']);
        });

        // Table pour les programmes de parrainage
        Schema::create('parrainages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parrain_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('filleul_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('terrain_id')->constrained('terrains_synthetiques_dakar')->onDelete('cascade');
            $table->string('code_parrainage')->unique();
            $table->integer('bonus_parrain_points')->default(100);
            $table->integer('bonus_filleul_points')->default(50);
            $table->decimal('bonus_parrain_reduction', 5, 2)->default(0.00); // pourcentage
            $table->decimal('bonus_filleul_reduction', 5, 2)->default(0.00);
            $table->boolean('est_utilise')->default(false);
            $table->timestamp('date_utilisation')->nullable();
            $table->timestamps();

            $table->index(['parrain_id', 'terrain_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parrainages');
        Schema::dropIfExists('niveaux_fidelite_terrain');
        Schema::dropIfExists('points_fidelite');
        Schema::dropIfExists('reductions_fidelite');
    }
}; 