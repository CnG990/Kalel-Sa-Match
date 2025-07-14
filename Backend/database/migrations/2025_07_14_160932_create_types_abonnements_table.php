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
        Schema::create('types_abonnements', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->text('description');
            $table->decimal('prix', 10, 2);
            $table->integer('duree_jours');
            $table->json('avantages');
            $table->boolean('est_actif')->default(true);
            $table->enum('categorie', ['basic', 'premium', 'entreprise', 'promo'])->default('basic');
            $table->boolean('est_visible')->default(true);
            $table->integer('ordre_affichage')->default(0);
            $table->integer('nb_reservations_max')->nullable();
            $table->integer('nb_terrains_favoris_max')->nullable();
            $table->decimal('reduction_pourcentage', 5, 2)->nullable();
            $table->date('date_debut_validite')->nullable();
            $table->date('date_fin_validite')->nullable();
            $table->string('couleur_theme')->nullable();
            $table->string('icone')->nullable();
            $table->json('fonctionnalites_speciales')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('types_abonnements');
    }
};
