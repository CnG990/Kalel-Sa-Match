<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Users table
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique();
            $table->string('mot_de_passe');
            $table->string('telephone')->nullable();
            $table->enum('role', ['admin', 'gestionnaire', 'client']);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Terrains synthetiques Dakar table
        Schema::create('terrains_synthetiques_dakar', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->text('description');
            $table->string('adresse');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('image_principale');
            $table->json('images_supplementaires')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Réservations
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('terrain_id')->constrained('terrains_synthetiques_dakar');
            $table->foreignId('user_id')->constrained();
            $table->dateTime('date_debut');
            $table->dateTime('date_fin');
            $table->decimal('montant_total', 10, 2);
            $table->enum('statut', ['en_attente', 'confirmee', 'annulee', 'terminee'])
                  ->default('en_attente');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 4. Abonnements
        Schema::create('abonnements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('terrain_id');
            $table->string('type_abonnement');
            $table->decimal('prix', 10, 2);
            $table->dateTime('date_debut');
            $table->dateTime('date_fin');
            $table->string('statut')->default('en_attente_paiement');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('terrain_id')->references('id')->on('terrains_synthetiques_dakar');
        });

        // 5. Souscriptions (lien entre users et abonnements)
        Schema::create('souscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('abonnement_id')->constrained();
            $table->dateTime('date_debut');
            $table->dateTime('date_fin');
            $table->enum('statut', ['active', 'expiree', 'annulee'])
                  ->default('active');
            $table->timestamps();
            $table->softDeletes();
        });

        // 6. Paiements
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->morphs('payable'); // Pour réservations ou souscriptions
            $table->string('reference_transaction')->unique();
            $table->decimal('montant', 10, 2);
            $table->enum('methode', ['carte', 'mobile_money', 'especes']);
            $table->enum('statut', ['en_attente', 'reussi', 'echoue', 'rembourse'])
                  ->default('en_attente');
            $table->json('details_transaction')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 7. Support tickets
        Schema::create('tickets_support', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('sujet');
            $table->text('description');
            $table->enum('priorite', ['basse', 'moyenne', 'haute'])
                  ->default('moyenne');
            $table->enum('statut', ['ouvert', 'en_cours', 'resolu', 'ferme'])
                  ->default('ouvert');
            $table->timestamps();
            $table->softDeletes();
        });

        // 8. Réponses aux tickets
        Schema::create('reponses_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets_support')
                  ->onDelete('cascade');
            $table->foreignId('user_id')->constrained();
            $table->text('contenu');
            $table->boolean('est_reponse_admin')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        // 9. Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('titre');
            $table->text('message');
            $table->string('type');
            $table->boolean('est_lu')->default(false);
            $table->timestamp('lu_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        // Drop tables in reverse order to respect foreign key constraints
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('reponses_tickets');
        Schema::dropIfExists('tickets_support');
        Schema::dropIfExists('paiements');
        Schema::dropIfExists('souscriptions');
        Schema::dropIfExists('abonnements');
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('terrains_synthetiques_dakar');
        Schema::dropIfExists('users');
    }
}; 