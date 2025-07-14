<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Table des demandes de remboursement
        // SUPPRIMER ou COMMENTER la création de la table demandes_remboursement
        // Schema::create('demandes_remboursement', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        //     $table->foreignId('reservation_id')->constrained('reservations')->onDelete('cascade');
        //     $table->foreignId('paiement_id')->nullable()->constrained('paiements')->onDelete('set null');
        //     $table->decimal('montant_demande', 10, 2);
        //     $table->decimal('montant_rembourse', 10, 2)->nullable();
        //     $table->enum('statut', ['en_attente', 'approuve', 'refuse', 'rembourse'])->default('en_attente');
        //     $table->enum('motif', ['annulation_client', 'probleme_terrain', 'conditions_meteo', 'autre'])->default('annulation_client');
        //     $table->text('description')->nullable();
        //     $table->text('justification_admin')->nullable();
        //     $table->timestamp('date_traitement')->nullable();
        //     $table->foreignId('traite_par')->nullable()->constrained('users')->onDelete('set null');
        //     $table->json('metadata')->nullable(); // Infos supplémentaires (preuves, photos, etc.)
        //     $table->timestamps();

        //     $table->index(['statut', 'created_at']);
        //     $table->index(['user_id', 'created_at']);
        // });

        // Table des tickets de support
        // SUPPRIMER car la table existe déjà dans la migration précédente
        // Schema::create('tickets_support', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('numero_ticket')->unique(); // TS-2025-001
        //     $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        //     $table->string('sujet');
        //     $table->text('description');
        //     $table->enum('priorite', ['basse', 'normale', 'haute', 'urgente'])->default('normale');
        //     $table->enum('categorie', ['technique', 'facturation', 'reservation', 'terrain', 'compte', 'autre'])->default('autre');
        //     $table->enum('statut', ['ouvert', 'en_cours', 'en_attente_client', 'resolu', 'ferme'])->default('ouvert');
        //     $table->foreignId('assigne_a')->nullable()->constrained('users')->onDelete('set null');
        //     $table->timestamp('date_resolution')->nullable();
        //     $table->integer('satisfaction_client')->nullable(); // Note 1-5
        //     $table->text('commentaire_satisfaction')->nullable();
        //     $table->json('metadata')->nullable(); // Fichiers joints, screenshots, etc.
        //     $table->timestamps();

        //     $table->index(['statut', 'created_at']);
        //     $table->index(['user_id', 'created_at']);
        //     $table->index(['assigne_a', 'statut']);
        //     $table->index(['categorie', 'priorite']);
        // });

        // Table des réponses aux tickets
        // SUPPRIMER car la table existe déjà dans la migration précédente
        // Schema::create('reponses_tickets', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('ticket_id')->constrained('tickets_support')->onDelete('cascade');
        //     $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        //     $table->text('message');
        //     $table->boolean('est_interne')->default(false); // Message visible uniquement pour les admins
        //     $table->json('fichiers_joints')->nullable();
        //     $table->timestamps();

        //     $table->index(['ticket_id', 'created_at']);
        // });

        // Insérer quelques données de test
        // SUPPRIMER ou COMMENTER l'insertion des données demandes_remboursement
        // DB::table('demandes_remboursement')->insert([
        //     [
        //         'user_id' => 1,
        //         'reservation_id' => 1,
        //         'montant_demande' => 25000.00,
        //         'statut' => 'en_attente',
        //         'motif' => 'annulation_client',
        //         'description' => 'Annulation pour raisons personnelles',
        //         'created_at' => now()->subDays(2),
        //         'updated_at' => now()->subDays(2)
        //     ],
        //     [
        //         'user_id' => 2,
        //         'reservation_id' => 2,
        //         'montant_demande' => 15000.00,
        //         'statut' => 'approuve',
        //         'motif' => 'conditions_meteo',
        //         'description' => 'Terrain impraticable à cause de la pluie',
        //         'created_at' => now()->subDays(5),
        //         'updated_at' => now()->subDay()
        //     ]
        // ]);

        // SUPPRIMER car les données sont déjà insérées dans la migration précédente
        // DB::table('tickets_support')->insert([
        //     [
        //         'numero_ticket' => 'TS-' . date('Y') . '-001',
        //         'user_id' => 1,
        //         'sujet' => 'Problème de réservation',
        //         'description' => 'Je n\'arrive pas à réserver le terrain pour demain',
        //         'priorite' => 'normale',
        //         'categorie' => 'technique',
        //         'statut' => 'ouvert',
        //         'created_at' => now()->subDays(1),
        //         'updated_at' => now()->subDays(1)
        //     ],
        //     [
        //         'numero_ticket' => 'TS-' . date('Y') . '-002',
        //         'user_id' => 2,
        //         'sujet' => 'Question sur les tarifs',
        //         'description' => 'Quels sont les tarifs pour les abonnements mensuels?',
        //         'priorite' => 'basse',
        //         'categorie' => 'facturation',
        //         'statut' => 'resolu',
        //         'date_resolution' => now()->subHours(2),
        //         'created_at' => now()->subDays(3),
        //         'updated_at' => now()->subHours(2)
        //     ]
        // ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // SUPPRIMER car la table reponses_tickets est gérée par la migration précédente
        // Schema::dropIfExists('reponses_tickets');
        // SUPPRIMER car la table tickets_support est gérée par la migration précédente
        // Schema::dropIfExists('tickets_support');
        // SUPPRIMER ou COMMENTER la suppression de la table demandes_remboursement
        // Schema::dropIfExists('demandes_remboursement');
    }
}; 