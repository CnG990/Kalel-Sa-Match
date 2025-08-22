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
        Schema::table('abonnements', function (Blueprint $table) {
            // Préférences de créneaux
            $table->integer('jour_prefere')->nullable()->comment('Jour préféré de la semaine (0=dimanche, 1=lundi, etc.)');
            $table->time('heure_preferee')->nullable()->comment('Heure préférée pour jouer');
            $table->integer('nb_seances_semaine')->default(1)->comment('Nombre de séances par semaine');
            $table->decimal('duree_seance', 3, 1)->default(1.0)->comment('Durée de chaque séance en heures');
            
            // Métadonnées sur les préférences
            $table->boolean('preferences_flexibles')->default(true)->comment('Les préférences sont-elles flexibles ou strictes?');
            $table->json('jours_alternatifs')->nullable()->comment('Jours alternatifs acceptés (JSON array)');
            $table->json('heures_alternatives')->nullable()->comment('Heures alternatives acceptées (JSON array)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('abonnements', function (Blueprint $table) {
            $table->dropColumn([
                'jour_prefere',
                'heure_preferee', 
                'nb_seances_semaine',
                'duree_seance',
                'preferences_flexibles',
                'jours_alternatifs',
                'heures_alternatives'
            ]);
        });
    }
};
