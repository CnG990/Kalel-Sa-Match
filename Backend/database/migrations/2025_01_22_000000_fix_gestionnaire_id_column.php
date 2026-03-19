<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // SUPPRIMER ou COMMENTER toute modification de la table terrains
        // Schema::table('terrains', function (Blueprint $table) { ... });

        // Vérifier pour la table terrains_synthetiques_dakar aussi
        if (!Schema::hasColumn('terrains_synthetiques_dakar', 'gestionnaire_id')) {
            Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
                $table->foreignId('gestionnaire_id')->nullable()->constrained('users')->after('id');
                $table->index('gestionnaire_id');
            });
        }

        // Ajouter d'autres colonnes manquantes pour la gestion complète
        if (!Schema::hasColumn('users', 'statut_validation')) {
            Schema::table('users', function (Blueprint $table) {
                $table->enum('statut_validation', ['en_attente', 'approuve', 'rejete', 'suspendu'])
                      ->default('en_attente')->after('role');
                $table->string('nom_entreprise')->nullable()->after('statut_validation');
                $table->string('numero_ninea')->nullable()->after('nom_entreprise');
                $table->string('numero_registre_commerce')->nullable()->after('numero_ninea');
                $table->string('adresse_entreprise')->nullable()->after('numero_registre_commerce');
                $table->string('adresse')->nullable()->after('adresse_entreprise');
                $table->text('description')->nullable()->after('adresse');
                $table->json('documents_legaux')->nullable()->after('description');
                $table->decimal('taux_commission_defaut', 5, 2)->nullable()->after('documents_legaux');
                $table->timestamp('date_validation')->nullable()->after('taux_commission_defaut');
                $table->foreignId('valide_par')->nullable()->constrained('users')->after('date_validation');
                $table->text('notes_admin')->nullable()->after('valide_par');
                $table->string('profile_image')->nullable()->after('notes_admin');
            });
        }

        // Ajouter des colonnes manquantes aux terrains_synthetiques_dakar (au lieu de terrains)
        if (!Schema::hasColumn('terrains_synthetiques_dakar', 'note_moyenne')) {
            Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
                $table->decimal('note_moyenne', 3, 2)->default(0)->after('est_disponible');
            });
        }

        if (!Schema::hasColumn('terrains_synthetiques_dakar', 'nombre_avis')) {
            Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
                $table->integer('nombre_avis')->default(0)->after('note_moyenne');
            });
        }

        if (!Schema::hasColumn('terrains_synthetiques_dakar', 'surface')) {
            Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
                $table->decimal('surface', 8, 2)->nullable()->after('nombre_avis');
            });
        }

        if (!Schema::hasColumn('terrains_synthetiques_dakar', 'equipements')) {
            Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
                $table->json('equipements')->nullable()->after('surface');
            });
        }

        if (!Schema::hasColumn('terrains_synthetiques_dakar', 'images')) {
            Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
                $table->json('images')->nullable()->after('equipements');
            });
        }

        if (!Schema::hasColumn('terrains_synthetiques_dakar', 'statut_validation')) {
            Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
                $table->enum('statut_validation', ['en_attente', 'approuve', 'rejete'])
                      ->default('en_attente')->after('images');
            });
        }

        // Ajouter QR code aux réservations (vérifier chaque colonne individuellement)
        if (!Schema::hasColumn('reservations', 'qr_code')) {
            Schema::table('reservations', function (Blueprint $table) {
                $table->string('qr_code')->nullable()->after('notes');
            });
        }
        
        if (!Schema::hasColumn('reservations', 'qr_code_path')) {
            Schema::table('reservations', function (Blueprint $table) {
                $table->string('qr_code_path')->nullable()->after('qr_code');
            });
        }
    }

    public function down()
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['qr_code', 'qr_code_path']);
        });

        // Supprimer les colonnes de terrains_synthetiques_dakar (au lieu de terrains)
        Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
            $table->dropColumn([
                'note_moyenne', 'nombre_avis', 'surface', 'equipements', 
                'images', 'statut_validation'
            ]);
            if (Schema::hasColumn('terrains_synthetiques_dakar', 'gestionnaire_id')) {
                $table->dropForeign(['gestionnaire_id']);
                $table->dropColumn('gestionnaire_id');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'statut_validation', 'nom_entreprise', 'numero_ninea', 
                'numero_registre_commerce', 'adresse_entreprise', 'adresse',
                'description', 'documents_legaux', 'taux_commission_defaut',
                'date_validation', 'notes_admin', 'profile_image'
            ]);
            if (Schema::hasColumn('users', 'valide_par')) {
                $table->dropForeign(['valide_par']);
                $table->dropColumn('valide_par');
            }
        });
    }
}; 