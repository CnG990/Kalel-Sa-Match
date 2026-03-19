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
        // Créer la table des remboursements
        Schema::create('remboursements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Montants
            $table->integer('montant_acompte')->default(5000); // FCFA
            $table->integer('montant_remboursement')->default(0); // FCFA
            $table->integer('montant_perdu')->default(0); // FCFA
            
            // Statut et dates
            $table->enum('statut', ['en_attente', 'approuve', 'refuse', 'non_applicable'])->default('en_attente');
            $table->timestamp('date_demande');
            $table->float('heures_avant_match', 8, 2); // Heures restantes avant le match
            
            // Informations d'annulation
            $table->text('motif_annulation');
            $table->enum('regle_appliquee', ['12h_plus', '12h_moins']);
            
            // Traitement par admin/gestionnaire
            $table->foreignId('traite_par')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('date_traitement')->nullable();
            $table->string('methode_remboursement', 50)->nullable(); // orange_money, virement, etc.
            $table->string('reference_transaction', 100)->nullable();
            $table->text('commentaire_admin')->nullable();
            
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['user_id', 'statut']);
            $table->index(['statut', 'date_demande']);
            $table->index('regle_appliquee');
        });
        
        // Ajouter des colonnes à la table reservations pour gérer les annulations
        Schema::table('reservations', function (Blueprint $table) {
            if (!Schema::hasColumn('reservations', 'date_annulation')) {
                $table->timestamp('date_annulation')->nullable()->after('statut');
            }
            if (!Schema::hasColumn('reservations', 'motif_annulation')) {
                $table->text('motif_annulation')->nullable()->after('date_annulation');
            }
            if (!Schema::hasColumn('reservations', 'annule_par')) {
                $table->foreignId('annule_par')->nullable()->constrained('users')->onDelete('set null')->after('motif_annulation');
            }
            if (!Schema::hasColumn('reservations', 'heures_avant_annulation')) {
                $table->float('heures_avant_annulation', 8, 2)->nullable()->after('annule_par');
            }
            if (!Schema::hasColumn('reservations', 'acompte_verse')) {
                $table->boolean('acompte_verse')->default(true)->after('heures_avant_annulation'); // Acompte de 5000 FCFA toujours versé
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer les colonnes ajoutées à reservations
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['annule_par']);
            $table->dropColumn([
                'date_annulation',
                'motif_annulation', 
                'annule_par',
                'heures_avant_annulation',
                'acompte_verse'
            ]);
        });
        
        // Supprimer la table remboursements
        Schema::dropIfExists('remboursements');
    }
}; 