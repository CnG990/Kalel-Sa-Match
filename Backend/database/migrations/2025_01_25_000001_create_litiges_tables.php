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
        // Table principale des litiges
        Schema::create('litiges', function (Blueprint $table) {
            $table->id();
            $table->string('numero_litige')->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('terrain_id')->constrained('terrains_synthetiques_dakar')->onDelete('cascade');
            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->onDelete('set null');
            $table->enum('type_litige', ['reservation', 'paiement', 'service', 'equipement', 'autre']);
            $table->string('sujet');
            $table->text('description');
            $table->enum('priorite', ['faible', 'normale', 'elevee', 'urgente'])->default('normale');
            $table->enum('statut', ['nouveau', 'en_cours', 'en_attente_reponse', 'escalade', 'resolu', 'ferme'])->default('nouveau');
            $table->enum('niveau_escalade', ['client', 'gestionnaire', 'admin'])->default('client');
            $table->json('preuves')->nullable(); // fichiers joints
            $table->text('resolution')->nullable();
            $table->integer('satisfaction_client')->nullable(); // 1-5 étoiles
            $table->foreignId('ferme_par')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('date_escalade')->nullable();
            $table->timestamp('date_fermeture')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'statut']);
            $table->index(['terrain_id', 'statut']);
            $table->index(['priorite', 'statut']);
        });

        // Table des messages/conversations dans les litiges
        Schema::create('messages_litige', function (Blueprint $table) {
            $table->id();
            $table->foreignId('litige_id')->constrained('litiges')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('role_expediteur', ['client', 'gestionnaire', 'admin']);
            $table->text('message');
            $table->enum('type_message', ['probleme_initial', 'reponse', 'escalade', 'resolution', 'information']);
            $table->json('pieces_jointes')->nullable();
            $table->boolean('lu')->default(false);
            $table->timestamp('lu_at')->nullable();
            $table->timestamps();

            $table->index(['litige_id', 'created_at']);
        });

        // Table pour les notifications de litiges
        Schema::create('notifications_litige', function (Blueprint $table) {
            $table->id();
            $table->foreignId('litige_id')->constrained('litiges')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type_notification'); // 'nouveau', 'reponse', 'escalade', 'fermeture'
            $table->string('titre');
            $table->text('message');
            $table->boolean('lu')->default(false);
            $table->timestamp('lu_at')->nullable();
            $table->json('metadata')->nullable(); // données supplémentaires
            $table->timestamps();

            $table->index(['user_id', 'lu']);
        });

        // Table pour l'historique des changements de statut
        Schema::create('historique_litige', function (Blueprint $table) {
            $table->id();
            $table->foreignId('litige_id')->constrained('litiges')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('action'); // 'creation', 'escalade', 'reponse', 'fermeture'
            $table->string('statut_avant')->nullable();
            $table->string('statut_apres');
            $table->text('commentaire')->nullable();
            $table->timestamps();

            $table->index(['litige_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historique_litige');
        Schema::dropIfExists('notifications_litige');
        Schema::dropIfExists('messages_litige');
        Schema::dropIfExists('litiges');
    }
}; 