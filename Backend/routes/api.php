<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TerrainController;
use App\Http\Controllers\API\ReservationController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\PaiementController;
use App\Http\Controllers\API\AbonnementController;
use App\Http\Controllers\API\AbonnementConditionsController;
use App\Http\Controllers\API\SupportController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\GestionnaireController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ImportTerrainController;
use App\Http\Controllers\API\FavoriteController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\AnalyticsController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\RefundController;
use App\Http\Controllers\API\ManagerTerrainController;
use App\Models\TerrainSynthetiquesDakar;
use App\Models\Reservation;
use App\Http\Controllers\API\FideliteController;
use App\Http\Controllers\API\LitigeController;
use App\Http\Controllers\API\TicketController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

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

// Route de statut pour tester l'API
Route::get('/status', function () {
    return response()->json([
        'status' => 'OK',
        'message' => 'API Kalel Sa Match fonctionne correctement',
        'timestamp' => now(),
        'version' => '1.0.0',
        'environment' => config('app.env'),
        'database' => 'Connected'
    ]);
});

// Route de test CORS spécifique
Route::options('/cors-test', function () {
    return response('', 200);
});

Route::post('/cors-test', function () {
    return response()->json([
        'status' => 'CORS OK',
        'message' => 'Test CORS réussi',
        'timestamp' => now(),
        'headers' => request()->headers->all()
    ]);
});

// Routes d'authentification (publiques)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'sendResetLink']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
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
    Route::get('/', [TerrainController::class, 'index']); // Seulement terrains actifs
    Route::get('/all-for-map', [TerrainController::class, 'allForMap']); // TOUS les terrains pour la carte
    Route::get('/nearby', [TerrainController::class, 'nearby']);
    Route::get('/search/by-location', [TerrainController::class, 'searchByLocation']);
    Route::get('/popular', [TerrainController::class, 'popular']);
    Route::get('/realtime-updates', [TerrainController::class, 'getRealtimeUpdates']);
    Route::get('/check-availability', [TerrainController::class, 'checkAvailability']); // Check créneaux publique
    Route::get('/{id}', [TerrainController::class, 'show']);
});

// Routes publiques pour vérification de disponibilité (avant connexion)
Route::post('/reservations/check-availability', [ReservationController::class, 'checkAvailability']);

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {
    
    // Profile utilisateur
    Route::prefix('user')->group(function () {
        Route::get('profile', [UserController::class, 'profile']);
        Route::post('profile', [UserController::class, 'updateProfile']);
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
    });

    // Paiements
    Route::prefix('paiements')->group(function () {
        Route::get('/', [PaiementController::class, 'index']);
        Route::post('/', [PaiementController::class, 'store']);
        Route::get('/{id}', [PaiementController::class, 'show']);
        Route::post('/{id}/process', [PaiementController::class, 'process']);
        Route::post('/mobile-money', [PaiementController::class, 'mobileMoney']);
        Route::post('/webhook', [PaiementController::class, 'webhook']);
        Route::post('/subscription', [PaiementController::class, 'processSubscriptionPayment']);
        Route::post('/reservation', [PaiementController::class, 'processReservationPayment']);
    });

    // Abonnements
    Route::prefix('abonnements')->group(function () {
        Route::get('/', [AbonnementController::class, 'index']);
        Route::post('/{id}/subscribe', [AbonnementController::class, 'subscribe']);
        Route::post('/recurring', [AbonnementController::class, 'createRecurringSubscription']);
        Route::get('/my-subscriptions', [AbonnementController::class, 'mySubscriptions']);
        Route::post('/cancel/{id}', [AbonnementController::class, 'cancel']);
        
        // ✅ Nouvelles routes pour gestionnaires et admins
        Route::get('/manager/subscriptions', [AbonnementController::class, 'getManagerSubscriptions']);
        Route::get('/admin/subscriptions', [AbonnementController::class, 'getAdminSubscriptions']);
        Route::put('/{id}/status', [AbonnementController::class, 'updateSubscriptionStatus']);
        
        // Conditions et préférences d'abonnement
        Route::get('/conditions/{terrainId}', [AbonnementConditionsController::class, 'getConditionsTerrain']);
        Route::get('/historique/{terrainId}', [AbonnementConditionsController::class, 'getHistoriqueReservations']);
        Route::post('/verifier-disponibilite', [AbonnementConditionsController::class, 'verifierDisponibilite']);
        Route::post('/verifier-disponibilite-abonnement', [AbonnementConditionsController::class, 'verifierDisponibiliteAbonnement']);
        Route::post('/calculer-prix', [AbonnementConditionsController::class, 'calculerPrixAbonnement']);
    });

    // Système de fidélité
    Route::prefix('fidelite')->group(function () {
        Route::get('/calculer/{terrainId}', [FideliteController::class, 'calculerFidelite']);
        Route::post('/appliquer-reduction', [FideliteController::class, 'appliquerReductionFidelite']);
        Route::get('/historique', [FideliteController::class, 'historiqueReductions']);
    });

    // Système de litiges
    Route::prefix('litiges')->group(function () {
        Route::post('/', [LitigeController::class, 'creerLitige']);
        Route::get('/mes-litiges', [LitigeController::class, 'mesLitiges']);
        Route::get('/{id}', [LitigeController::class, 'detailsLitige']);
        Route::post('/{id}/messages', [LitigeController::class, 'ajouterMessage']);
        Route::post('/{id}/escalader', [LitigeController::class, 'escaladerLitige']);
        Route::post('/{id}/fermer', [LitigeController::class, 'fermerLitige']);
    });

    // Système de tickets/QR codes
    Route::prefix('tickets')->group(function () {
        Route::get('/reservation/{id}', [TicketController::class, 'getTicket']);
        Route::post('/scan', [TicketController::class, 'scanTicket']);
        Route::post('/validate-code', [TicketController::class, 'validateByCode']);
        Route::get('/validations-history', [TicketController::class, 'getValidationsHistory']);
    });

    // Routes pour les tickets utilisateur
    Route::get('/user/tickets', [TicketController::class, 'getUserTickets']);
    Route::get('/tickets/{id}/download', [TicketController::class, 'downloadTicket']);

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

    // Système de remboursement avec règles d'acompte
    Route::prefix('refunds')->group(function () {
        Route::get('/calculate/{reservationId}', [RefundController::class, 'calculateRefund']);
        Route::post('/cancel/{reservationId}', [RefundController::class, 'cancelReservation']);
        Route::get('/my-refunds', [RefundController::class, 'myRefunds']);
        
        // Routes admin/gestionnaire pour traiter les remboursements
        Route::middleware('role:admin,gestionnaire')->group(function () {
            Route::get('/stats', [RefundController::class, 'refundStats']);
            Route::put('/process/{remboursementId}', [RefundController::class, 'processRefund']);
        });
    });

    // Routes pour les actions de remboursement et annulation (tous les utilisateurs authentifiés)
    Route::prefix('reservations')->group(function () {
        Route::post('/{id}/request-refund', [ReservationController::class, 'requestRefund']);
        Route::post('/{id}/reschedule', [ReservationController::class, 'reschedule']);
        Route::get('/{id}/refund-options', [ReservationController::class, 'getRefundOptions']);
    });

    // Routes pour la gestion complète des terrains par les gestionnaires ET administrateurs
    Route::middleware('role:gestionnaire,admin')->group(function () {
        Route::get('terrains/mes-terrains', [TerrainController::class, 'mesTerrains']);
        Route::post('terrains', [TerrainController::class, 'store']);
        Route::put('terrains/{id}', [TerrainController::class, 'update']);
        Route::put('terrains/{id}/prix', [TerrainController::class, 'updatePrix']);
        Route::put('terrains/{id}/toggle-disponibilite', [TerrainController::class, 'toggleDisponibilite']);
        Route::post('terrains/{id}/images', [TerrainController::class, 'uploadImages']);
        Route::delete('terrains/{id}/images', [TerrainController::class, 'deleteImage']);
        Route::get('terrains/{id}/statistiques', [TerrainController::class, 'statistiques']);
        Route::delete('terrains/{id}', [TerrainController::class, 'destroy']);
    });

    // Routes pour la gestion des gestionnaires (actions de type manager) - ADMIN ET GESTIONNAIRES
    Route::middleware('role:gestionnaire,admin')->prefix('manager')->group(function () {
        Route::get('terrains', [GestionnaireController::class, 'getTerrains']);
        Route::put('terrains/{id}', [TerrainController::class, 'managerUpdate']);
        Route::get('reservations', [GestionnaireController::class, 'getReservations']);
        Route::put('reservations/{id}/status', [ReservationController::class, 'updateStatus']);
        Route::get('stats/dashboard', [GestionnaireController::class, 'getStatistiques']);
        Route::get('stats/revenue', [GestionnaireController::class, 'getRevenueStats']);
        
        // Route pour valider les codes de tickets (remplace QR codes)
        Route::post('validate-ticket', [GestionnaireController::class, 'validateTicketCode']);
        Route::get('validation-history', [GestionnaireController::class, 'getValidationHistory']);
        
        // Routes pour la gestion des codes de tickets
        Route::get('ticket-codes', [GestionnaireController::class, 'getTicketCodes']);
        Route::post('/reservations/{id}/generate-ticket', [GestionnaireController::class, 'generateTicketForReservation']);
    });

    Route::get('/user', [AuthController::class, 'user']);
});

// ===================================================================
// ROUTES POUR L'ADMINISTRATION
// ===================================================================
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard-stats', [AdminController::class, 'getDashboardStats']);
    Route::get('/users', [AdminController::class, 'getAllUsers']);
    Route::get('/users/{id}', [AdminController::class, 'getUser']);
    Route::put('/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    Route::post('/users/{id}/reset-password', [AdminController::class, 'resetUserPassword']);
    Route::get('/users/{id}/reservations', [AdminController::class, 'getUserReservations']);
    Route::get('/users/{id}/paiements', [AdminController::class, 'getUserPaiements']);
    Route::get('/terrains', [AdminController::class, 'getAllTerrains']);
    Route::post('/terrains', [AdminController::class, 'createTerrain']);
    Route::put('/terrains/{id}', [AdminController::class, 'updateTerrain']);
    Route::post('/terrains/{id}/image', [AdminController::class, 'uploadTerrainImage']);
    Route::delete('/terrains/{id}', [AdminController::class, 'deleteTerrain']);
    Route::post('/terrains/import-geo', [AdminController::class, 'importGeoData']);
    Route::get('/terrains/export-geo', [AdminController::class, 'exportGeoData']);
    
    // Import KML Google Earth batch (nouveau)
    Route::post('/terrains/import-kml-batch', [AdminController::class, 'importKMLBatch']);
    Route::get('/terrains/postgis-stats', [AdminController::class, 'getPostGISStats']);
    Route::post('/terrains/calculate-surfaces', [AdminController::class, 'calculateTerrainSurfaces']);
    Route::post('/terrains/{id}/calculate-surface', [AdminController::class, 'calculateTerrainSurface']);
    
    // Prix variables des terrains
    Route::get('/terrains/{id}/prix-variables', [AdminController::class, 'getPrixVariables']);
    Route::post('/terrains/calculer-prix', [AdminController::class, 'calculerPrix']);
    
    Route::get('/finances', [AdminController::class, 'getAdminFinances']);
    Route::get('/disputes', [AdminController::class, 'getAllDisputes']);
    Route::get('/support/tickets', [AdminController::class, 'getAllSupportTickets']);
    Route::get('/pending-managers', [AdminController::class, 'getPendingManagers']);
    Route::put('/managers/{id}/approve', [AdminController::class, 'approveManager']);
    Route::put('/managers/{id}/reject', [AdminController::class, 'rejectManager']);
    // Gestion des finances
    Route::get('/finances', [AdminController::class, 'getAdminFinances']);
    
    // RAPPORTS AVEC VRAIES DONNÉES DE LA BASE
    Route::get('/reports', [AdminController::class, 'getReports']);
    
    // Gestion des contrats de commission
    Route::get('/contrats-commission', [AdminController::class, 'getContratsCommission']);
    Route::post('/contrats-commission', [AdminController::class, 'createContratCommission']);
    Route::put('/contrats-commission/{id}', [AdminController::class, 'updateContratCommission']);
    Route::delete('/contrats-commission/{id}', [AdminController::class, 'deleteContratCommission']);
    
    // Gestion des paiements
    Route::get('/payments', [AdminController::class, 'getAllPayments']);
    Route::get('/payments/{id}', [AdminController::class, 'getPayment']);
    Route::put('/payments/{id}/status', [AdminController::class, 'updatePaymentStatus']);
    Route::post('/payments/{id}/refund', [AdminController::class, 'refundPayment']);
    
    // Gestion des abonnements
    Route::get('/subscriptions', [AdminController::class, 'getAllSubscriptions']);
    Route::get('/subscribers', [AdminController::class, 'getAllSubscribers']);
    Route::post('/subscriptions', [AdminController::class, 'createSubscription']);
    Route::put('/subscriptions/{id}', [AdminController::class, 'updateSubscription']);
    Route::delete('/subscriptions/{id}', [AdminController::class, 'deleteSubscription']);
    Route::put('/subscriptions/{id}/status', [AdminController::class, 'updateSubscriptionStatus']);
    
    // Gestion des notifications
    Route::get('/notifications', [AdminController::class, 'getAllNotifications']);
    Route::get('/notification-templates', [AdminController::class, 'getNotificationTemplates']);
    Route::post('/notifications', [AdminController::class, 'createNotification']);
    Route::put('/notifications/{id}', [AdminController::class, 'updateNotification']);
    Route::delete('/notifications/{id}', [AdminController::class, 'deleteNotification']);
    Route::post('/notifications/{id}/send', [AdminController::class, 'sendNotification']);
    Route::post('/notification-templates', [AdminController::class, 'createNotificationTemplate']);
    Route::put('/notification-templates/{id}', [AdminController::class, 'updateNotificationTemplate']);
    Route::delete('/notification-templates/{id}', [AdminController::class, 'deleteNotificationTemplate']);
    
    // Gestion des logs
    Route::get('/logs', [AdminController::class, 'getAllLogs']);
    Route::get('/logs/{id}', [AdminController::class, 'getLog']);
    Route::delete('/logs', [AdminController::class, 'clearLogs']);
    Route::get('/logs/export', [AdminController::class, 'exportLogs']);
    
    // Gestion des réservations (admin)
    Route::get('/reservations', [AdminController::class, 'getAllReservations']);
    Route::get('/reservations/{id}', [AdminController::class, 'getReservation']);
    Route::put('/reservations/{id}/status', [AdminController::class, 'updateReservationStatus']);
    Route::put('/reservations/{id}/notes', [AdminController::class, 'updateReservationNotes']);
    Route::delete('/reservations/{id}', [AdminController::class, 'deleteReservation']);
    
    // Gestion des tickets (admin)
    Route::post('/reservations/{id}/generate-ticket', [AdminController::class, 'generateTicketForReservation']);
    Route::post('/tickets/validate', [AdminController::class, 'validateTicket']);
    
    // Rapports et statistiques
    Route::get('/reports/revenue', [AdminController::class, 'getRevenueReport']);
    Route::get('/reports/users', [AdminController::class, 'getUsersReport']);
    Route::get('/reports/terrains', [AdminController::class, 'getTerrainsReport']);
    Route::get('/reports/reservations', [AdminController::class, 'getReservationsReport']);
    Route::post('/reports/export/{type}', [AdminController::class, 'exportReport']);
    
    // Configuration système
    Route::get('/config', [AdminController::class, 'getSystemConfig']);
    Route::put('/config', [AdminController::class, 'updateSystemConfig']);
    Route::get('/system/performance', [AdminController::class, 'getSystemPerformance']);
    
    // Nettoyage des logs
    Route::delete('/logs/cleanup', [AdminController::class, 'clearLogs']);
});

// ===================================================================
// ROUTES POUR LES GESTIONNAIRES - NOUVEAU SYSTÈME
// ===================================================================
Route::middleware(['auth:sanctum', 'role:gestionnaire,admin'])->prefix('manager')->group(function () {
    // Gestion des terrains avec terrains_synthetiques_dakar
    Route::get('/terrains', [ManagerTerrainController::class, 'mesTerrains']);
    Route::post('/terrains', [ManagerTerrainController::class, 'store']);
    Route::put('/terrains/{id}/prix-capacite', [ManagerTerrainController::class, 'updatePrixCapacite']);
    Route::put('/terrains/{id}/toggle-disponibilite', [ManagerTerrainController::class, 'toggleDisponibilite']);
    Route::get('/terrains/{id}/statistiques', [ManagerTerrainController::class, 'statistiques']);
    
    // Gestion des promotions
    Route::get('/promotions', function() {
        return response()->json([
            'success' => true,
            'data' => [
                [
                    'id' => 1,
                    'nom' => 'Réduction Fidélité',
                    'description' => 'Remise de 20% pour les abonnés depuis plus de 3 mois',
                    'type_reduction' => 'pourcentage',
                    'valeur_reduction' => 20,
                    'date_debut' => '2025-06-01',
                    'date_fin' => '2025-06-30',
                    'code_promo' => 'FIDELE20',
                    'limite_utilisations' => 50,
                    'utilisations_actuelles' => 12,
                    'est_active' => true,
                    'cible_abonnes' => true,
                    'created_at' => '2025-06-01T10:00:00Z'
                ]
            ]
        ]);
    });
    Route::post('/promotions', function() {
        return response()->json(['success' => true, 'message' => 'Promotion créée']);
    });
    Route::put('/promotions/{id}', function($id) {
        return response()->json(['success' => true, 'message' => 'Promotion mise à jour']);
    });
    Route::delete('/promotions/{id}', function($id) {
        return response()->json(['success' => true, 'message' => 'Promotion supprimée']);
    });
    Route::post('/promotions/{id}/envoyer-abonnes', function($id) {
        return response()->json(['success' => true, 'message' => 'Promotion envoyée aux abonnés']);
    });
    Route::get('/abonnes', function() {
        return response()->json([
            'success' => true,
            'data' => [
                [
                    'id' => 1,
                    'nom' => 'Diallo',
                    'prenom' => 'Amadou',
                    'email' => 'amadou.diallo@email.com',
                    'telephone' => '+221 77 123 45 67',
                    'abonnements_actifs' => 2,
                    'derniere_connexion' => '2025-06-25T15:30:00Z'
                ]
            ]
        ]);
    });
    
    // Anciennes routes gestionnaire (à maintenir pour compatibilité)
    Route::get('/reservations', [GestionnaireController::class, 'getReservations']);
    Route::get('/statistiques', [GestionnaireController::class, 'getStatistiques']);
});

// Route de test pour vérifier l'API et CORS
Route::get('/test', function () {
    return response()->json([
        'status' => 'OK',
        'message' => 'API Terrains Synthétiques Dakar - Test CORS',
        'timestamp' => now(),
        'version' => '1.0.0'
    ]);
});

// Route de test CORS simple
Route::get('/test-cors', function () {
    return response()->json([
        'cors' => 'working',
        'message' => 'CORS fonctionne correctement'
    ]);
});

// Routes de diagnostic pour Render
Route::get('/test-db', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'status' => 'OK',
            'message' => 'Base de données accessible',
            'connection' => config('database.default'),
            'database' => config('database.connections.pgsql.database')
        ]);
    } catch (Exception $e) {
        return response()->json([
            'status' => 'ERROR',
            'message' => 'Erreur de connexion à la base de données',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/test-table/{table}', function ($table) {
    try {
        $exists = Schema::hasTable($table);
        $count = $exists ? DB::table($table)->count() : 0;
        
        return response()->json([
            'table' => $table,
            'exists' => $exists,
            'count' => $count,
            'status' => $exists ? 'OK' : 'MISSING'
        ]);
    } catch (Exception $e) {
        return response()->json([
            'table' => $table,
            'exists' => false,
            'error' => $e->getMessage(),
            'status' => 'ERROR'
        ], 500);
    }
});

Route::post('/force-migrate', function () {
    try {
        // Exécuter les migrations
        Artisan::call('migrate', ['--force' => true]);
        
        // Vérifier les tables créées
        $tables = ['users', 'terrains_synthetiques_dakar', 'reservations', 'abonnements', 'paiements'];
        $results = [];
        
        foreach ($tables as $table) {
            $exists = Schema::hasTable($table);
            $results[$table] = $exists;
        }
        
        return response()->json([
            'status' => 'OK',
            'message' => 'Migrations exécutées avec succès',
            'tables' => $results
        ]);
    } catch (Exception $e) {
        return response()->json([
            'status' => 'ERROR',
            'message' => 'Erreur lors des migrations',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/migration-status', function () {
    try {
        $migrations = DB::table('migrations')->get();
        $tables = ['users', 'terrains_synthetiques_dakar', 'reservations', 'abonnements', 'paiements'];
        $tableStatus = [];
        
        foreach ($tables as $table) {
            $tableStatus[$table] = Schema::hasTable($table);
        }
        
        return response()->json([
            'migrations_count' => $migrations->count(),
            'tables_status' => $tableStatus,
            'database' => config('database.connections.pgsql.database')
        ]);
    } catch (Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'status' => 'ERROR'
        ], 500);
    }
});

// QR Code routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/reservations/{id}/qr-code', [ReservationController::class, 'getQrCode']);
    Route::post('/reservations/{id}/generate-qr', [ReservationController::class, 'generateQrCode']);
    Route::post('/qr-code/verify', [ReservationController::class, 'verifyQrCode']);
    Route::post('/qr/verify', [ReservationController::class, 'verifyQrCode']);
    Route::put('/reservations/{id}/status', [ReservationController::class, 'updateManagerReservationStatus']);
});

// Admin QR Code management
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/reservations/{id}/qr-code', [AdminController::class, 'getReservationQrCode']);
    Route::post('/reservations/{id}/regenerate-qr', [AdminController::class, 'regenerateQrCode']);
});

// Gestionnaire QR Code scanning
Route::middleware(['auth:sanctum', 'role:gestionnaire'])->prefix('gestionnaire')->group(function () {
    Route::post('/qr-code/scan', [GestionnaireController::class, 'scanQrCode']);
    Route::get('/reservations/today', [GestionnaireController::class, 'getTodayReservations']);
});

// Routes pour la gestion géomatique des terrains
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin/terrains')->group(function () {
    Route::post('/', [TerrainController::class, 'store']);
    Route::post('/import-geo', [TerrainController::class, 'importGeoData']);
    Route::get('/export-geo', [TerrainController::class, 'exportGeoData']);
});

// Routes pour les favoris
Route::prefix('favorites')->group(function () {
    Route::get('/', [FavoriteController::class, 'index']);
    Route::post('/terrain/{terrainId}/toggle', [FavoriteController::class, 'toggle']);
    Route::get('/terrain/{terrainId}/check', [FavoriteController::class, 'check']);
    Route::delete('/{favoriteId}', [FavoriteController::class, 'destroy']);
});

// Routes pour les notifications
Route::prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/{id}', [NotificationController::class, 'destroy']);
});

// Routes pour les analyses
Route::prefix('analytics')->group(function () {
    Route::post('/events', [AnalyticsController::class, 'trackEvent']);
    Route::post('/events/batch', [AnalyticsController::class, 'trackEventsBatch']);
    Route::post('/performance', [AnalyticsController::class, 'trackPerformance']);
    Route::post('/error', [AnalyticsController::class, 'trackError']);
});

// Routes pour les messages/chat
Route::prefix('messages')->group(function () {
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::post('/conversations', [MessageController::class, 'createConversation']);
    Route::get('/conversations/{id}/messages', [MessageController::class, 'getMessages']);
    Route::post('/conversations/{id}/messages', [MessageController::class, 'sendMessage']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markAsRead']);
});

// Routes pour les paiements
Route::prefix('payments')->group(function () {
    Route::post('/', [PaiementController::class, 'store']);
    Route::get('/my-payments', [PaiementController::class, 'myPayments']);
    Route::get('/{id}', [PaiementController::class, 'show']);
    Route::post('/{id}/verify', [PaiementController::class, 'verify']);
});

// Routes pour les webhooks
Route::prefix('webhooks')->group(function () {
    Route::post('/orange-money', [PaiementController::class, 'orangeMoneyWebhook']);
    Route::post('/wave', [PaiementController::class, 'waveWebhook']);
    Route::post('/paypal', [PaiementController::class, 'paypalWebhook']);
});

// Route de fallback
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Endpoint non trouvé'
    ], 404);
});

 
