<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5174', 
        'http://localhost:5173', 
        'http://127.0.0.1:5174', 
        'http://127.0.0.1:5173', 
        'http://127.0.0.1:8000',
        'https://kalel-sa-match.vercel.app',
        'https://kalel-sa-match.vercel.app/',
        'https://kalel-sa-match.onrender.com',
        'https://kalel-sa-match.onrender.com/'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*', 'Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],

    'exposed_headers' => ['*'],

    'max_age' => 0,

    'supports_credentials' => true,

];