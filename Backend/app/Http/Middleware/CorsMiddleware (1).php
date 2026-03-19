<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Ne traiter que les requêtes non-OPTIONS (Laravel gère les OPTIONS)
        if ($request->isMethod('OPTIONS')) {
            return $next($request);
        }

        // Pour les autres requêtes, traiter normalement puis ajouter les headers CORS
        $response = $next($request);
        
        // Headers CORS pour toutes les requêtes
        // Utiliser la configuration CORS de Laravel au lieu de hardcoder
        $allowedOrigins = config('cors.allowed_origins', []);
        $origin = $request->headers->get('Origin');
        
        // Vérifier si l'origine est autorisée
        if (in_array($origin, $allowedOrigins) || in_array('*', $allowedOrigins)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin ?? '*');
        }
        
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Max-Age', '86400');

        return $response;
    }
} 