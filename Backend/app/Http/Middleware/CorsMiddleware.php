<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Gérer les requêtes OPTIONS (preflight)
        if ($request->isMethod('OPTIONS')) {
            $origin = $request->headers->get('Origin');
            $allowedOrigins = config('cors.allowed_origins', []);
            
            // Vérifier si l'origine est autorisée
            if (in_array($origin, $allowedOrigins) || in_array('*', $allowedOrigins)) {
                return response('', 200)
                    ->header('Access-Control-Allow-Origin', $origin ?? '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With')
                    ->header('Access-Control-Allow-Credentials', 'true')
                    ->header('Access-Control-Max-Age', '86400');
            }
            
            return response('', 200);
        }

        // Pour les autres requêtes, traiter normalement puis ajouter les headers CORS
        $response = $next($request);
        
        // Headers CORS pour toutes les requêtes
        $allowedOrigins = config('cors.allowed_origins', []);
        $origin = $request->headers->get('Origin');
        
        // Vérifier si l'origine est autorisée
        if ($origin && (in_array($origin, $allowedOrigins) || in_array('*', $allowedOrigins))) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        } elseif (in_array('*', $allowedOrigins)) {
            $response->headers->set('Access-Control-Allow-Origin', '*');
        }
        
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Max-Age', '86400');

        return $response;
    }
} 