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
        Schema::create('avis_terrains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('terrain_id')->constrained('terrains_synthetiques_dakar')->onDelete('cascade');
            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->onDelete('set null');
            $table->tinyInteger('note')->unsigned(); // Note de 1 à 5
            $table->text('commentaire')->nullable();
            $table->boolean('est_approuve')->default(false); // Pour modération si nécessaire
            $table->timestamps();

            // Assurer qu'un utilisateur ne peut laisser qu'un seul avis par terrain
            $table->unique(['user_id', 'terrain_id']);
            
            // Index pour améliorer les performances
            $table->index('terrain_id');
            $table->index('user_id');
            $table->index('note');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avis_terrains');
    }
};

