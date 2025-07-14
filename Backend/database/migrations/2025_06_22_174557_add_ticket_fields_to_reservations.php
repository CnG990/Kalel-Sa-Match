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
        Schema::table('reservations', function (Blueprint $table) {
            // Code du ticket pour validation manuelle (remplace QR code)
            $table->string('code_ticket', 50)->nullable()->unique()->after('statut');
            
            // Horodatage de la dernière validation par un gestionnaire
            $table->timestamp('derniere_validation')->nullable()->after('code_ticket');
            
            // Index pour améliorer les performances de recherche
            $table->index('code_ticket');
            $table->index('derniere_validation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropIndex(['code_ticket']);
            $table->dropIndex(['derniere_validation']);
            $table->dropColumn(['code_ticket', 'derniere_validation']);
        });
    }
};
