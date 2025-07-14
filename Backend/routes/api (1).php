<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TerrainController;
use App\Http\Controllers\API\ReservationController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\PaiementController;
use App\Http\Controllers\API\AbonnementController;
use App\Http\Controllers\API\SupportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes d'authentification (publiques)
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    
    // Routes protégées par authentification
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::put('update-profile', [AuthController::class, 'updateProfile']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
    });
});

// Routes publiques des terrains
Route::prefix('terrains')->group(function () {
    Route::get('/', [TerrainController::class, 'index']);
    Route::get('/nearby', [TerrainController::class, 'nearby']);
    Route::get('/search/by-location', [TerrainController::class, 'searchByLocation']);
    Route::get('/popular', [TerrainController::class, 'popular']);
    Route::get('/{id}', [TerrainController::class, 'show']);
});

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {
    
    // Profile utilisateur
    Route::prefix('user')->group(function () {
        Route::get('profile', [UserController::class, 'profile']);
        Route::put('profile', [UserController::class, 'updateProfile']);
        Route::get('reservations', [UserController::class, 'reservations']);
        Route::get('favorites', [UserController::class, 'favorites']);
        Route::post('favorites/{terrain}', [UserController::class, 'addFavorite']);
        Route::delete('favorites/{terrain}', [UserController::class, 'removeFavorite']);
    });

    // Réservations
    Route::prefix('reservations')->group(function () {
        Route::get('/', [ReservationController::class, 'index']);
        Route::get('/my-reservations', [ReservationController::class, 'myReservations']);
        Route::post('/', [ReservationController::class, 'store']);
        Route::get('/{id}', [ReservationController::class, 'show']);
        Route::put('/{id}', [ReservationController::class, 'update']);
        Route::delete('/{id}', [ReservationController::class, 'destroy']);
        Route::post('/{id}/confirm', [ReservationController::class, 'confirm']);
        Route::post('/{id}/cancel', [ReservationController::class, 'cancel']);
        
        // Vérification de disponibilité
        Route::post('/check-availability', [ReservationController::class, 'checkAvailability']);
    });

    // Paiements
    Route::prefix('paiements')->group(function () {
        Route::get('/', [PaiementController::class, 'index']);
        Route::post('/', [PaiementController::class, 'store']);
        Route::get('/{id}', [PaiementController::class, 'show']);
        Route::post('/{id}/process', [PaiementController::class, 'process']);
        Route::post('/mobile-money', [PaiementController::class, 'mobileMoney']);
        Route::post('/webhook', [PaiementController::class, 'webhook']);
    });

    // Abonnements
    Route::prefix('abonnements')->group(function () {
        Route::get('/', [AbonnementController::class, 'index']);
        Route::post('/{id}/subscribe', [AbonnementController::class, 'subscribe']);
        Route::get('/my-subscriptions', [AbonnementController::class, 'mySubscriptions']);
        Route::post('/cancel/{id}', [AbonnementController::class, 'cancel']);
    });

    // Support
    Route::prefix('support')->group(function () {
        Route::get('/tickets', [SupportController::class, 'index']);
        Route::post('/tickets', [SupportController::class, 'store']);
        Route::get('/tickets/{id}', [SupportController::class, 'show']);
        Route::post('/tickets/{id}/reply', [SupportController::class, 'reply']);
        Route::put('/tickets/{id}/close', [SupportController::class, 'close']);
    });

    // Routes Admin uniquement
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Gestion des utilisateurs
        Route::apiResource('users', UserController::class);
        Route::put('users/{id}/status', [UserController::class, 'updateStatus']);
        Route::get('stats/overview', [UserController::class, 'statsOverview']);
        
        // Gestion des terrains (admin)
        Route::post('terrains', [TerrainController::class, 'store']);
        Route::put('terrains/{id}', [TerrainController::class, 'update']);
        Route::delete('terrains/{id}', [TerrainController::class, 'destroy']);
        Route::put('terrains/{id}/status', [TerrainController::class, 'updateStatus']);
        
        // Gestion des abonnements (admin)
        Route::apiResource('abonnements', AbonnementController::class);
        
        // Support admin
        Route::get('support/tickets', [SupportController::class, 'adminIndex']);
        Route::put('support/tickets/{id}/assign', [SupportController::class, 'assign']);
        Route::put('support/tickets/{id}/status', [SupportController::class, 'updateStatus']);
    });

    // Routes Gestionnaire uniquement
    Route::middleware('role:gestionnaire')->prefix('manager')->group(function () {
        // Gestion des terrains du gestionnaire
        Route::get('terrains', [TerrainController::class, 'managerTerrains']);
        Route::put('terrains/{id}', [TerrainController::class, 'managerUpdate']);
        Route::get('reservations', [ReservationController::class, 'managerReservations']);
        Route::put('reservations/{id}/status', [ReservationController::class, 'updateStatus']);
        
        // Statistiques gestionnaire
        Route::get('stats/dashboard', [TerrainController::class, 'managerStats']);
        Route::get('stats/revenue', [PaiementController::class, 'managerRevenue']);
    });
});

// Route de test pour vérifier l'API
Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'message' => 'API Terrains Synthétiques Dakar',
        'timestamp' => now(),
        'version' => '1.0.0'
    ]);
}); 