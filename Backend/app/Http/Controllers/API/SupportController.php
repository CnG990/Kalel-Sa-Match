<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class SupportController extends Controller
{
    /**
     * Lister les tickets de support de l'utilisateur
     */
    public function index(): JsonResponse
    {
        try {
            // Pour l'instant, simulons les tickets avec des données statiques
            $tickets = [
                [
                    'id' => 1,
                    'user_id' => Auth::id(),
                    'sujet' => 'Problème de réservation',
                    'description' => 'Je n\'arrive pas à réserver un terrain pour demain',
                    'statut' => 'ouvert',
                    'priorite' => 'moyenne',
                    'created_at' => now()->subDays(2),
                    'updated_at' => now()->subDays(1),
                ],
                [
                    'id' => 2,
                    'user_id' => Auth::id(),
                    'sujet' => 'Remboursement',
                    'description' => 'Je souhaite un remboursement pour ma réservation annulée',
                    'statut' => 'en_cours',
                    'priorite' => 'haute',
                    'created_at' => now()->subDays(5),
                    'updated_at' => now()->subHours(3),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $tickets
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des tickets',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau ticket de support
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'sujet' => 'required|string|max:255',
                'description' => 'required|string',
                'priorite' => 'required|in:basse,moyenne,haute,urgente',
                'categorie' => 'required|in:technique,facturation,reservation,autre',
            ]);

            // Simulation de création de ticket
            $ticket = [
                'id' => rand(1000, 9999),
                'user_id' => Auth::id(),
                'sujet' => $request->sujet,
                'description' => $request->description,
                'statut' => 'ouvert',
                'priorite' => $request->priorite,
                'categorie' => $request->categorie,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Ticket de support créé avec succès',
                'data' => $ticket
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un ticket de support
     */
    public function show($id): JsonResponse
    {
        try {
            // Simulation de récupération de ticket
            $ticket = [
                'id' => $id,
                'user_id' => Auth::id(),
                'sujet' => 'Problème de réservation',
                'description' => 'Description détaillée du problème...',
                'statut' => 'ouvert',
                'priorite' => 'moyenne',
                'categorie' => 'technique',
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(1),
                'messages' => [
                    [
                        'id' => 1,
                        'auteur' => 'client',
                        'message' => 'Bonjour, j\'ai un problème avec...',
                        'created_at' => now()->subDays(2)
                    ],
                    [
                        'id' => 2,
                        'auteur' => 'support',
                        'message' => 'Bonjour, nous allons examiner votre problème...',
                        'created_at' => now()->subDays(1)
                    ]
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $ticket
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket introuvable',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Répondre à un ticket
     */
    public function reply(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'message' => 'required|string',
            ]);

            // Simulation d'ajout de réponse
            $reponse = [
                'id' => rand(1000, 9999),
                'ticket_id' => $id,
                'auteur' => 'client',
                'message' => $request->message,
                'created_at' => now(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Réponse ajoutée avec succès',
                'data' => $reponse
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout de la réponse',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fermer un ticket
     */
    public function close($id): JsonResponse
    {
        try {
            // Simulation de fermeture de ticket
            return response()->json([
                'success' => true,
                'message' => 'Ticket fermé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la fermeture du ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Routes Admin

    /**
     * Lister tous les tickets (Admin)
     */
    public function adminIndex(): JsonResponse
    {
        try {
            $tickets = [
                [
                    'id' => 1,
                    'user_id' => 1,
                    'user_name' => 'Jean Dupont',
                    'sujet' => 'Problème de réservation',
                    'statut' => 'ouvert',
                    'priorite' => 'moyenne',
                    'categorie' => 'technique',
                    'created_at' => now()->subDays(2),
                ],
                [
                    'id' => 2,
                    'user_id' => 2,
                    'user_name' => 'Marie Martin',
                    'sujet' => 'Remboursement',
                    'statut' => 'en_cours',
                    'priorite' => 'haute',
                    'categorie' => 'facturation',
                    'created_at' => now()->subDays(5),
                ],
                [
                    'id' => 3,
                    'user_id' => 3,
                    'user_name' => 'Ahmed Diallo',
                    'sujet' => 'Modification de profil',
                    'statut' => 'resolu',
                    'priorite' => 'basse',
                    'categorie' => 'autre',
                    'created_at' => now()->subWeek(),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $tickets
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des tickets',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assigner un ticket à un agent (Admin)
     */
    public function assign(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'agent_id' => 'required|exists:users,id',
            ]);

            // Simulation d'assignation
            return response()->json([
                'success' => true,
                'message' => 'Ticket assigné avec succès'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'assignation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour le statut d'un ticket (Admin)
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'statut' => 'required|in:ouvert,en_cours,resolu,ferme',
            ]);

            // Simulation de mise à jour de statut
            return response()->json([
                'success' => true,
                'message' => 'Statut du ticket mis à jour avec succès'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 