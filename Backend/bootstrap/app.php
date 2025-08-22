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
        
        // Activer CORS pour toutes les requêtes
        $middleware->web(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        $middleware->api(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        // Middleware CORS global pour toutes les requêtes
        $middleware->web(prepend: [
            \App\Http\Middleware\PreflightMiddleware::class,
            \App\Http\Middleware\CorsMiddleware::class,
        ]);
        
        $middleware->api(prepend: [
            \App\Http\Middleware\PreflightMiddleware::class,
            \App\Http\Middleware\CorsMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
