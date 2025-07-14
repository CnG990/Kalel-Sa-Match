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
            if (!Schema::hasColumn('reservations', 'qr_code_path')) {
            $table->string('qr_code_path')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('reservations', 'qr_code_token')) {
            $table->string('qr_code_token')->nullable()->after('qr_code_path');
            $table->index('qr_code_token');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropIndex(['qr_code_token']);
            $table->dropColumn(['qr_code_path', 'qr_code_token']);
        });
    }
};
