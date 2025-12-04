<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Enregistrer le middleware de vérification des rôles
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'check.role' => \App\Http\Middleware\CheckRole::class,
        ]);
        
        // Configuration API avec CORS
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
        
        // Activer CORS pour toutes les requêtes (utiliser le middleware Laravel natif uniquement)
        $middleware->web(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        $middleware->api(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
            \App\Http\Middleware\SecurityHeadersMiddleware::class,
        ]);
        
        // Note: Les middlewares CorsMiddleware et PreflightMiddleware ont été retirés
        // car ils entraient en conflit avec le middleware Laravel natif HandleCors
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
