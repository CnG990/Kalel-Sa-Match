<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('abonnements', function (Blueprint $table) {
            // Vérifier et ajouter les champs manquants seulement s'ils n'existent pas
            if (!Schema::hasColumn('abonnements', 'user_id')) {
                $table->bigInteger('user_id')->unsigned()->after('id');
            }
            if (!Schema::hasColumn('abonnements', 'terrain_id')) {
                $table->bigInteger('terrain_id')->unsigned()->after('user_id');
            }
            if (!Schema::hasColumn('abonnements', 'date_debut')) {
                $table->datetime('date_debut')->after('prix');
            }
            if (!Schema::hasColumn('abonnements', 'date_fin')) {
                $table->datetime('date_fin')->after('date_debut');
            }
            if (!Schema::hasColumn('abonnements', 'statut')) {
                $table->enum('statut', ['en_attente_paiement', 'actif', 'expire', 'annule', 'suspendu'])
                      ->default('en_attente_paiement')
                      ->after('date_fin');
            }
        });
        
        // Ajouter les clés étrangères séparément après avoir créé les colonnes
        Schema::table('abonnements', function (Blueprint $table) {
            if (Schema::hasColumn('abonnements', 'user_id') && !$this->foreignKeyExists('abonnements', 'abonnements_user_id_foreign')) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            }
            if (Schema::hasColumn('abonnements', 'terrain_id') && !$this->foreignKeyExists('abonnements', 'abonnements_terrain_id_foreign')) {
                $table->foreign('terrain_id')->references('id')->on('terrains_synthetiques_dakar')->onDelete('cascade');
            }
        });
    }
    
    private function foreignKeyExists($table, $constraintName)
    {
        $result = \DB::select("SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = ? AND constraint_type = 'FOREIGN KEY' AND constraint_name = ?", [$table, $constraintName]);
        return count($result) > 0;
    }

    public function down()
    {
        Schema::table('abonnements', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['terrain_id']);
            $table->dropColumn(['user_id', 'terrain_id', 'date_debut', 'date_fin', 'statut']);
        });
    }
}; 