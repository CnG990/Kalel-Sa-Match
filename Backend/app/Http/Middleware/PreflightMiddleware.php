<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class PreflightMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Intercepter les requêtes OPTIONS avant tout autre traitement
        if ($request->isMethod('OPTIONS')) {
            $response = response('', 200);
            $response->headers->set('Access-Control-Allow-Origin', 'https://kalel-sa-match.vercel.app');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', '86400');
            return $response;
        }

        return $next($request);
    }
} 