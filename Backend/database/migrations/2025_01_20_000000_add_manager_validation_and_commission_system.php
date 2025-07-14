<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Ajouter des champs au tableau users pour les gestionnaires
        Schema::table('users', function (Blueprint $table) {
            // Statut de validation pour les gestionnaires
            $table->enum('statut_validation', ['en_attente', 'approuve', 'rejete', 'suspendu'])
                  ->default('en_attente')->after('role');
            
            // Informations légales pour les gestionnaires
            $table->string('nom_entreprise')->nullable()->after('telephone');
            $table->string('numero_ninea')->nullable()->after('nom_entreprise');
            $table->string('numero_registre_commerce')->nullable()->after('numero_ninea');
            $table->text('adresse_entreprise')->nullable()->after('numero_registre_commerce');
            
            // Documents légaux (JSON pour stocker les chemins des fichiers)
            $table->json('documents_legaux')->nullable()->after('adresse_entreprise');
            
            // Commission par défaut
            $table->decimal('taux_commission_defaut', 5, 2)->nullable()->after('documents_legaux');
            
            // Date de validation
            $table->timestamp('date_validation')->nullable()->after('taux_commission_defaut');
            $table->foreignId('valide_par')->nullable()->constrained('users')->after('date_validation');
            
            // Notes admin
            $table->text('notes_admin')->nullable()->after('valide_par');
        });

        // 2. Table pour les contrats de commission
        Schema::create('contrats_commission', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gestionnaire_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('terrain_synthetique_id')->nullable()->constrained('terrains_synthetiques_dakar')->onDelete('cascade');
            $table->decimal('taux_commission', 5, 2); // Pourcentage
            $table->enum('type_contrat', ['global', 'par_terrain'])->default('global');
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->enum('statut', ['actif', 'suspendu', 'expire', 'annule'])->default('actif');
            $table->text('conditions_speciales')->nullable();
            $table->json('historique_negociation')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Table pour les imports de fichiers (KoBoCollect, CSV, etc.)
        Schema::create('imports_terrains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('importe_par')->constrained('users');
            $table->string('nom_fichier_original');
            $table->string('chemin_fichier');
            $table->enum('type_fichier', ['csv', 'json', 'geojson', 'kml', 'shapefile']);
            $table->enum('source', ['kobocollect', 'upload_manuel', 'api_externe']);
            $table->json('metadonnees')->nullable(); // Colonnes, coordonnées, etc.
            $table->enum('statut_traitement', ['en_attente', 'en_cours', 'termine', 'erreur']);
            $table->text('resultats_traitement')->nullable();
            $table->integer('nb_terrains_importes')->default(0);
            $table->timestamps();
        });

        // 4. Ajouter des champs aux terrains pour la gestion par fichiers
        Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
            // Gestionnaire assigné
            $table->foreignId('gestionnaire_id')->nullable()->constrained('users')->after('id');
            
            // Informations géospatiales supplémentaires
            $table->json('coordonnees_polygon')->nullable()->after('longitude');
            $table->string('fichier_forme')->nullable()->after('coordonnees_polygon');
            
            // Source de création
            $table->foreignId('import_id')->nullable()->constrained('imports_terrains')->after('fichier_forme');
            $table->enum('source_creation', ['manuel', 'import_csv', 'kobocollect'])->default('manuel')->after('import_id');
            
            // Validation admin
            $table->enum('statut_validation', ['en_attente', 'approuve', 'rejete'])->default('en_attente')->after('source_creation');
            $table->foreignId('valide_par')->nullable()->constrained('users')->after('statut_validation');
            $table->timestamp('date_validation')->nullable()->after('valide_par');
        });

        // 5. Table pour les demandes de nouveaux terrains par les gestionnaires
        Schema::create('demandes_terrains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gestionnaire_id')->constrained('users')->onDelete('cascade');
            $table->string('nom_terrain');
            $table->text('description');
            $table->string('adresse');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->json('coordonnees_polygon')->nullable();
            $table->json('images_proposees')->nullable();
            $table->json('documents_justificatifs')->nullable(); // Titre de propriété, bail, etc.
            $table->enum('statut', ['en_attente', 'approuve', 'rejete', 'en_revision'])->default('en_attente');
            $table->text('commentaires_admin')->nullable();
            $table->foreignId('traite_par')->nullable()->constrained('users');
            $table->timestamp('date_traitement')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 6. Table pour l'historique des validations
        Schema::create('historique_validations', function (Blueprint $table) {
            $table->id();
            $table->morphs('validable'); // Pour users, terrains, demandes, etc.
            $table->foreignId('validateur_id')->constrained('users');
            $table->enum('action', ['approuve', 'rejete', 'suspendu', 'reactive']);
            $table->text('raison')->nullable();
            $table->json('donnees_avant')->nullable();
            $table->json('donnees_apres')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('historique_validations');
        Schema::dropIfExists('demandes_terrains');
        Schema::dropIfExists('contrats_commission');
        Schema::dropIfExists('imports_terrains');
        
        Schema::table('terrains_synthetiques_dakar', function (Blueprint $table) {
            $table->dropForeign(['gestionnaire_id']);
            $table->dropForeign(['import_id']);
            $table->dropForeign(['valide_par']);
            $table->dropColumn([
                'gestionnaire_id', 'coordonnees_polygon', 'fichier_forme',
                'import_id', 'source_creation', 'statut_validation', 'valide_par', 'date_validation'
            ]);
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['valide_par']);
            $table->dropColumn([
                'statut_validation', 'nom_entreprise', 'numero_ninea', 
                'numero_registre_commerce', 'adresse_entreprise', 'documents_legaux',
                'taux_commission_defaut', 'date_validation', 'valide_par', 'notes_admin'
            ]);
        });
    }
}; 