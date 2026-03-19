<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('prix_terrains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('terrain_id')->constrained('terrains_synthetiques_dakar')->onDelete('cascade');
            $table->string('taille')->nullable(); // 5x5, 8x8, 11x11, etc.
            $table->string('nom_terrain_specifique')->nullable(); // Anfield, Camp Nou, Old Trafford
            $table->string('periode')->nullable(); // creuses, pleines, jour, nuit
            $table->string('jour_semaine')->nullable(); // lundi, mardi, dimanche, weekend, semaine
            $table->decimal('prix', 10, 2);
            $table->string('duree')->nullable(); // 1h, 1h30, 90mn
            $table->time('heure_debut')->nullable();
            $table->time('heure_fin')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->timestamps();
            
            // Index pour optimiser les recherches
            $table->index(['terrain_id', 'taille', 'periode', 'jour_semaine']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('prix_terrains');
    }
};










