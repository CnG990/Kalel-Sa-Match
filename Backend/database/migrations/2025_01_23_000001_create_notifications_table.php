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
        // Vérifier si la table existe déjà
        if (Schema::hasTable('notifications')) {
            return; // Ne rien faire si la table existe déjà
        }
        
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // reservation_confirmed, payment_received, etc.
            $table->morphs('notifiable'); // user_id + user_type
            $table->json('data'); // Données de la notification
            $table->timestamp('read_at')->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->string('channel')->default('database'); // database, email, sms, push
            $table->boolean('sent')->default(false);
            $table->timestamp('send_at')->nullable(); // Pour notifications programmées
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['notifiable_type', 'notifiable_id']);
            $table->index(['read_at']);
            $table->index(['created_at']);
            $table->index(['sent', 'send_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
}; 