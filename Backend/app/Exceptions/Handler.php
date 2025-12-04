<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $exception)
    {
        // Ne pas exposer les détails d'erreur en production
        if (!config('app.debug') && $request->expectsJson()) {
            // Erreurs de validation
            if ($exception instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $exception->errors()
                ], 422);
            }

            // Erreurs de base de données
            if ($exception instanceof QueryException) {
                \Log::error('Database error: ' . $exception->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Une erreur est survenue lors du traitement de votre demande'
                ], 500);
            }

            // Autres erreurs
            \Log::error('Application error: ' . $exception->getMessage(), [
                'exception' => get_class($exception),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue'
            ], 500);
        }

        return parent::render($request, $exception);
    }
}

