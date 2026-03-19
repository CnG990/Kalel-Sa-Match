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
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_name'); // page_view, reservation_created, payment_completed
            $table->string('event_category')->nullable(); // user_action, system, error
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('session_id')->nullable();
            $table->json('properties')->nullable(); // Données spécifiques à l'événement
            $table->json('user_agent')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->string('referrer')->nullable();
            $table->string('page_url')->nullable();
            $table->decimal('value', 10, 2)->nullable(); // Valeur monétaire si applicable
            $table->timestamps();
            
            // Index pour optimiser les requêtes d'analytics
            $table->index(['event_name', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['event_category', 'created_at']);
        });

        Schema::create('performance_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('metric_name'); // page_load_time, api_response_time, db_query_time
            $table->decimal('value', 10, 3); // Valeur en millisecondes
            $table->string('context')->nullable(); // Page, API endpoint, etc.
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['metric_name', 'created_at']);
            $table->index(['context', 'created_at']);
        });

        Schema::create('error_logs', function (Blueprint $table) {
            $table->id();
            $table->string('error_type'); // frontend, backend, api
            $table->string('severity')->default('error'); // info, warning, error, critical
            $table->text('message');
            $table->text('stack_trace')->nullable();
            $table->string('file_path')->nullable();
            $table->integer('line_number')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('user_agent')->nullable();
            $table->json('context')->nullable();
            $table->boolean('resolved')->default(false);
            $table->timestamps();
            
            $table->index(['error_type', 'severity', 'created_at']);
            $table->index(['resolved', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('error_logs');
        Schema::dropIfExists('performance_metrics');
        Schema::dropIfExists('analytics_events');
    }
}; 