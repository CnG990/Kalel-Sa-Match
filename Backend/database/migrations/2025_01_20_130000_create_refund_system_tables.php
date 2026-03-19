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
        // Ajouter les champs manquants à la table reservations
        Schema::table('reservations', function (Blueprint $table) {
            // Champs pour les annulations
            $table->text('raison_annulation')->nullable()->after('notes');
            $table->timestamp('date_annulation')->nullable()->after('raison_annulation');
            $table->decimal('montant_rembourse', 10, 2)->default(0)->after('date_annulation');
            $table->decimal('frais_annulation', 10, 2)->default(0)->after('montant_rembourse');
            
            // Champs pour les reprogrammations
            $table->text('raison_reprogrammation')->nullable()->after('frais_annulation');
            $table->timestamp('date_reprogrammation')->nullable()->after('raison_reprogrammation');
            $table->decimal('frais_reprogrammation', 10, 2)->default(0)->after('date_reprogrammation');
            $table->timestamp('ancienne_date_debut')->nullable()->after('frais_reprogrammation');
            $table->timestamp('ancienne_date_fin')->nullable()->after('ancienne_date_debut');
            
            // Mettre à jour les statuts possibles
            $table->string('statut')->change(); // Remplacer l'enum pour permettre plus de valeurs
        });

        // Créer la table des demandes de remboursement
        Schema::create('demandes_remboursement', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type_remboursement', [
                'refund_full', 
                'refund_partial', 
                'refund_minimal', 
                'weather_refund'
            ]);
            $table->decimal('montant_demande', 10, 2);
            $table->text('raison');
            $table->enum('statut', [
                'en_attente_approbation',
                'approuve',
                'rejete',
                'traite'
            ])->default('en_attente_approbation');
            $table->text('evidence_meteorologique')->nullable();
            $table->text('commentaire_admin')->nullable();
            $table->timestamp('date_traitement')->nullable();
            $table->foreignId('traite_par')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['reservation_id']);
            $table->index(['user_id']);
            $table->index(['statut']);
            $table->index(['type_remboursement']);
        });

        // Créer la table pour l'historique des modifications de prix
        Schema::create('historique_prix_terrains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('terrain_id')->constrained('terrains_synthetiques_dakar')->onDelete('cascade');
            $table->foreignId('gestionnaire_id')->constrained('users')->onDelete('cascade');
            $table->decimal('ancien_prix', 8, 2);
            $table->decimal('nouveau_prix', 8, 2);
            $table->text('raison')->nullable();
            $table->timestamp('created_at');
            
            $table->index(['terrain_id']);
            $table->index(['created_at']);
        });

        // Créer la table des notifications système
        Schema::create('notifications_systeme', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type'); // 'refund_approved', 'reschedule_confirmed', 'price_changed', etc.
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Données supplémentaires (IDs de réservation, montants, etc.)
            $table->boolean('is_read')->default(false);
            $table->timestamps();
            
            $table->index(['user_id', 'is_read']);
            $table->index(['type']);
            $table->index(['created_at']);
        });

        // Créer la table pour les politiques de remboursement par terrain
        Schema::create('politiques_remboursement', function (Blueprint $table) {
            $table->id();
            $table->foreignId('terrain_id')->constrained('terrains_synthetiques_dakar')->onDelete('cascade');
            $table->json('regles_remboursement'); // Règles personnalisées par terrain
            $table->boolean('remboursement_meteorologique')->default(true);
            $table->integer('delai_annulation_gratuite')->default(24); // Heures
            $table->decimal('frais_annulation_tardive', 5, 2)->default(20.00); // Pourcentage
            $table->boolean('reprogrammation_autorisee')->default(true);
            $table->integer('delai_min_reprogrammation')->default(2); // Heures
            $table->timestamps();
            
            $table->unique('terrain_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('politiques_remboursement');
        Schema::dropIfExists('notifications_systeme');
        Schema::dropIfExists('historique_prix_terrains');
        Schema::dropIfExists('demandes_remboursement');
        
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'raison_annulation',
                'date_annulation',
                'montant_rembourse',
                'frais_annulation',
                'raison_reprogrammation',
                'date_reprogrammation',
                'frais_reprogrammation',
                'ancienne_date_debut',
                'ancienne_date_fin'
            ]);
        });
    }
}; 