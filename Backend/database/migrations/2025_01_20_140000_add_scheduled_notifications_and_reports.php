<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // 1. D'abord créer la table des templates de notifications
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('sujet');
            $table->text('contenu_html');
            $table->text('contenu_texte')->nullable();
            $table->json('variables')->nullable(); // Variables disponibles comme {{nom}}, {{terrain}}
            $table->enum('categorie', ['systeme', 'marketing', 'rappel', 'promo']);
            $table->boolean('est_actif')->default(true);
            $table->foreignId('cree_par')->constrained('users');
            $table->timestamps();
        });

        // 2. Ensuite améliorer la table notifications existante
        Schema::table('notifications', function (Blueprint $table) {
            // Notifications programmées
            $table->timestamp('date_programmee')->nullable()->after('type');
            $table->enum('statut_envoi', ['brouillon', 'programme', 'envoye', 'echoue'])
                  ->default('brouillon')->after('date_programmee');
            $table->timestamp('date_envoi')->nullable()->after('statut_envoi');
            
            // Ciblage des notifications
            $table->json('cibles')->nullable()->after('date_envoi'); // roles, specific users, etc.
            $table->enum('type_notification', ['info', 'warning', 'success', 'error', 'promo'])
                  ->default('info')->after('cibles');
            
            // Templates et récurrence
            $table->foreignId('template_id')->nullable()->constrained('notification_templates')->after('type_notification');
            $table->boolean('est_recurrente')->default(false)->after('template_id');
            $table->json('parametres_recurrence')->nullable()->after('est_recurrente');
            
            // Statistiques
            $table->integer('nb_destinataires')->default(0)->after('parametres_recurrence');
            $table->integer('nb_envoyes')->default(0)->after('nb_destinataires');
            $table->integer('nb_lus')->default(0)->after('nb_envoyes');
        });

        // 3. Table pour les rapports générés
        Schema::create('rapports_generes', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->enum('type', ['financier', 'utilisateurs', 'reservations', 'terrains', 'custom']);
            $table->json('parametres'); // Filtres, dates, etc.
            $table->json('donnees_rapport'); // Résultats du rapport
            $table->string('fichier_export')->nullable(); // Chemin vers PDF/Excel
            $table->enum('statut', ['en_cours', 'termine', 'erreur'])->default('en_cours');
            $table->foreignId('genere_par')->constrained('users');
            $table->timestamp('date_generation');
            $table->timestamp('expire_le')->nullable();
            $table->timestamps();
        });

        // 4. Table pour les tâches programmées
        Schema::create('taches_programmees', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('type'); // 'notification', 'rapport', 'nettoyage', etc.
            $table->json('parametres');
            $table->string('cron_expression'); // Format cron pour la récurrence
            $table->timestamp('derniere_execution')->nullable();
            $table->timestamp('prochaine_execution')->nullable();
            $table->boolean('est_active')->default(true);
            $table->integer('nb_executions')->default(0);
            $table->text('derniere_erreur')->nullable();
            $table->foreignId('cree_par')->constrained('users');
            $table->timestamps();
        });

        // 5. Améliorer la table abonnements pour plus de fonctionnalités
        Schema::table('abonnements', function (Blueprint $table) {
            // Catégories et visibilité
            $table->enum('categorie', ['basic', 'premium', 'entreprise', 'promo'])
                  ->default('basic')->after('duree_jours');
            $table->boolean('est_visible')->default(true)->after('categorie');
            $table->integer('ordre_affichage')->default(0)->after('est_visible');
            
            // Limites et quotas
            $table->integer('nb_reservations_max')->nullable()->after('ordre_affichage');
            $table->integer('nb_terrains_favoris_max')->nullable()->after('nb_reservations_max');
            $table->decimal('reduction_pourcentage', 5, 2)->nullable()->after('nb_terrains_favoris_max');
            
            // Dates de validité
            $table->date('date_debut_validite')->nullable()->after('reduction_pourcentage');
            $table->date('date_fin_validite')->nullable()->after('date_debut_validite');
            
            // Métadonnées
            $table->string('couleur_theme')->nullable()->after('date_fin_validite');
            $table->string('icone')->nullable()->after('couleur_theme');
            $table->json('fonctionnalites_speciales')->nullable()->after('icone');
        });

        // 6. Table pour les statistiques des abonnements
        Schema::create('statistiques_abonnements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('abonnement_id')->constrained('abonnements')->onDelete('cascade');
            $table->date('date_statistique');
            $table->integer('nb_souscriptions_jour')->default(0);
            $table->integer('nb_annulations_jour')->default(0);
            $table->decimal('revenus_jour', 10, 2)->default(0);
            $table->integer('nb_utilisations_jour')->default(0);
            $table->timestamps();
            
            $table->unique(['abonnement_id', 'date_statistique']);
        });

        // 5. Table pour les logs système
        Schema::create('logs_systeme', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('niveau', ['debug', 'info', 'warning', 'error', 'critical']);
            $table->string('module', 50); // admin, gestionnaire, client, system, etc.
            $table->string('action'); // login, logout, create_terrain, etc.
            $table->text('details')->nullable(); // JSON avec détails supplémentaires
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            
            // Index pour améliorer les performances
            $table->index(['niveau', 'created_at']);
            $table->index(['module', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        // 6. Table pour la configuration système
        Schema::create('configuration_systeme', function (Blueprint $table) {
            $table->id();
            $table->string('cle')->unique();
            $table->text('valeur');
            $table->string('section', 50); // general, paiements, notifications, etc.
            $table->string('type', 20)->default('string'); // string, boolean, integer, float, json
            $table->text('description')->nullable();
            $table->boolean('visible_interface')->default(true);
            $table->boolean('modifiable')->default(true);
            $table->timestamps();
        });

        // Insérer la configuration par défaut
        DB::table('configuration_systeme')->insert([
            // Configuration générale
            [
                'cle' => 'nom_plateforme',
                'valeur' => 'Terrains Synthétiques Dakar',
                'section' => 'general',
                'type' => 'string',
                'description' => 'Nom de la plateforme affiché aux utilisateurs',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'email_admin',
                'valeur' => 'admin@terrains-dakar.com',
                'section' => 'general',
                'type' => 'string',
                'description' => 'Email principal de l\'administrateur',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'telephone_support',
                'valeur' => '+221 70 123 45 67',
                'section' => 'general',
                'type' => 'string',
                'description' => 'Numéro de téléphone du support',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'devise',
                'valeur' => 'FCFA',
                'section' => 'general',
                'type' => 'string',
                'description' => 'Devise utilisée sur la plateforme',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'timezone',
                'valeur' => 'Africa/Dakar',
                'section' => 'general',
                'type' => 'string',
                'description' => 'Fuseau horaire de la plateforme',
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Configuration paiements
            [
                'cle' => 'commission_defaut',
                'valeur' => '10',
                'section' => 'paiements',
                'type' => 'float',
                'description' => 'Taux de commission par défaut (en %)',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'delai_remboursement',
                'valeur' => '7',
                'section' => 'paiements',
                'type' => 'integer',
                'description' => 'Délai de remboursement en jours',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'orange_money_actif',
                'valeur' => '1',
                'section' => 'paiements',
                'type' => 'boolean',
                'description' => 'Activation des paiements Orange Money',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'wave_actif',
                'valeur' => '1',
                'section' => 'paiements',
                'type' => 'boolean',
                'description' => 'Activation des paiements Wave',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'paypal_actif',
                'valeur' => '0',
                'section' => 'paiements',
                'type' => 'boolean',
                'description' => 'Activation des paiements PayPal',
                'created_at' => now(),
                'updated_at' => now()
            ],

            // Configuration notifications
            [
                'cle' => 'email_notifications',
                'valeur' => '1',
                'section' => 'notifications',
                'type' => 'boolean',
                'description' => 'Activation des notifications par email',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'sms_notifications',
                'valeur' => '0',
                'section' => 'notifications',
                'type' => 'boolean',
                'description' => 'Activation des notifications par SMS',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'push_notifications',
                'valeur' => '1',
                'section' => 'notifications',
                'type' => 'boolean',
                'description' => 'Activation des notifications push',
                'created_at' => now(),
                'updated_at' => now()
            ],

            // Configuration réservations
            [
                'cle' => 'delai_annulation',
                'valeur' => '24',
                'section' => 'reservations',
                'type' => 'integer',
                'description' => 'Délai d\'annulation gratuite en heures',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'max_reservations_par_jour',
                'valeur' => '3',
                'section' => 'reservations',
                'type' => 'integer',
                'description' => 'Nombre maximum de réservations par jour par utilisateur',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'auto_confirm',
                'valeur' => '0',
                'section' => 'reservations',
                'type' => 'boolean',
                'description' => 'Confirmation automatique des réservations',
                'created_at' => now(),
                'updated_at' => now()
            ],

            // Configuration maintenance
            [
                'cle' => 'mode_maintenance',
                'valeur' => '0',
                'section' => 'maintenance',
                'type' => 'boolean',
                'description' => 'Activer le mode maintenance',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'message_maintenance',
                'valeur' => 'Site en maintenance. Nous serons de retour bientôt.',
                'section' => 'maintenance',
                'type' => 'string',
                'description' => 'Message affiché pendant la maintenance',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'nettoyage_auto_logs',
                'valeur' => '1',
                'section' => 'maintenance',
                'type' => 'boolean',
                'description' => 'Nettoyage automatique des logs anciens',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'cle' => 'retention_logs_jours',
                'valeur' => '90',
                'section' => 'maintenance',
                'type' => 'integer',
                'description' => 'Durée de rétention des logs en jours',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('statistiques_abonnements');
        Schema::dropIfExists('taches_programmees');
        Schema::dropIfExists('rapports_generes');
        Schema::dropIfExists('notification_templates');
        
        Schema::dropIfExists('logs_systeme');
        Schema::dropIfExists('configuration_systeme');
        
        Schema::table('abonnements', function (Blueprint $table) {
            $table->dropColumn([
                'categorie', 'est_visible', 'ordre_affichage', 'nb_reservations_max',
                'nb_terrains_favoris_max', 'reduction_pourcentage', 'date_debut_validite',
                'date_fin_validite', 'couleur_theme', 'icone', 'fonctionnalites_speciales'
            ]);
        });
        
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['template_id']);
            $table->dropColumn([
                'date_programmee', 'statut_envoi', 'date_envoi', 'cibles', 'type_notification',
                'template_id', 'est_recurrente', 'parametres_recurrence', 'nb_destinataires',
                'nb_envoyes', 'nb_lus'
            ]);
        });
    }
}; 