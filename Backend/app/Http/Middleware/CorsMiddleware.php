<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Headers CORS pour toutes les requêtes
        $response->headers->set('Access-Control-Allow-Origin', 'https://kalel-sa-match.vercel.app');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');

        // Gestion spéciale des requêtes OPTIONS (preflight)
        if ($request->isMethod('OPTIONS')) {
            $response->setStatusCode(200);
            $response->setContent('');
        }

        return $response;
    }
} 