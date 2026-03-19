<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AvisTerrain;
use App\Models\TerrainSynthetiquesDakar;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AvisController extends Controller
{
    /**
     * Lister les avis d'un terrain
     */
    public function index(Request $request, $terrainId): JsonResponse
    {
        try {
            $terrain = TerrainSynthetiquesDakar::findOrFail($terrainId);

            $avis = AvisTerrain::pourTerrain($terrainId)
                ->approuves()
                ->with(['user:id,nom,prenom'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($avis) {
                    return [
                        'id' => $avis->id,
                        'user' => [
                            'id' => $avis->user->id,
                            'nom' => $avis->user->nom,
                            'prenom' => $avis->user->prenom,
                        ],
                        'note' => $avis->note,
                        'commentaire' => $avis->commentaire,
                        'date' => $avis->created_at->format('Y-m-d H:i:s'),
                        'date_formatee' => $avis->created_at->format('d/m/Y'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $avis,
                'statistiques' => [
                    'note_moyenne' => $terrain->note_moyenne ?? 0,
                    'nombre_avis' => $terrain->nombre_avis ?? 0,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouvel avis
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'terrain_id' => 'required|exists:terrains_synthetiques_dakar,id',
                'reservation_id' => 'nullable|exists:reservations,id',
                'note' => 'required|integer|min:1|max:5',
                'commentaire' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $userId = Auth::id();
            $terrainId = $request->terrain_id;

            // Vérifier si l'utilisateur a déjà laissé un avis pour ce terrain
            if (AvisTerrain::utilisateurAdejaAvis($userId, $terrainId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà laissé un avis pour ce terrain'
                ], 409);
            }

            // Vérifier si la réservation existe et appartient à l'utilisateur (si fournie)
            if ($request->reservation_id) {
                $reservation = Reservation::findOrFail($request->reservation_id);
                if ($reservation->user_id !== $userId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cette réservation ne vous appartient pas'
                    ], 403);
                }
                if ($reservation->terrain_synthetique_id != $terrainId && $reservation->terrain_id != $terrainId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cette réservation ne correspond pas à ce terrain'
                    ], 400);
                }
            }

            // Créer l'avis (approuvé par défaut, peut être modéré plus tard)
            $avis = AvisTerrain::create([
                'user_id' => $userId,
                'terrain_id' => $terrainId,
                'reservation_id' => $request->reservation_id,
                'note' => $request->note,
                'commentaire' => $request->commentaire,
                'est_approuve' => true, // Approuvé par défaut
            ]);

            // Mettre à jour la note moyenne et le nombre d'avis du terrain
            $terrain = TerrainSynthetiquesDakar::findOrFail($terrainId);
            $terrain->getAverageRating();

            return response()->json([
                'success' => true,
                'message' => 'Avis créé avec succès',
                'data' => [
                    'id' => $avis->id,
                    'note' => $avis->note,
                    'commentaire' => $avis->commentaire,
                    'date' => $avis->created_at->format('Y-m-d H:i:s'),
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un avis existant
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $avis = AvisTerrain::findOrFail($id);

            // Vérifier que l'avis appartient à l'utilisateur connecté
            if ($avis->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à modifier cet avis'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'note' => 'sometimes|required|integer|min:1|max:5',
                'commentaire' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $avis->update($request->only(['note', 'commentaire']));

            // Mettre à jour la note moyenne du terrain
            $terrain = TerrainSynthetiquesDakar::findOrFail($avis->terrain_id);
            $terrain->getAverageRating();

            return response()->json([
                'success' => true,
                'message' => 'Avis mis à jour avec succès',
                'data' => [
                    'id' => $avis->id,
                    'note' => $avis->note,
                    'commentaire' => $avis->commentaire,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un avis
     */
    public function destroy($id): JsonResponse
    {
        try {
            $avis = AvisTerrain::findOrFail($id);

            // Vérifier que l'avis appartient à l'utilisateur connecté
            if ($avis->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à supprimer cet avis'
                ], 403);
            }

            $terrainId = $avis->terrain_id;
            $avis->delete();

            // Mettre à jour la note moyenne du terrain
            $terrain = TerrainSynthetiquesDakar::findOrFail($terrainId);
            $terrain->getAverageRating();

            return response()->json([
                'success' => true,
                'message' => 'Avis supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier si l'utilisateur peut laisser un avis pour un terrain
     */
    public function canReview($terrainId): JsonResponse
    {
        try {
            $userId = Auth::id();
            $hasAvis = AvisTerrain::utilisateurAdejaAvis($userId, $terrainId);
            
            // Vérifier si l'utilisateur a des réservations terminées pour ce terrain
            $hasReservations = Reservation::where('user_id', $userId)
                ->where(function($query) use ($terrainId) {
                    $query->where('terrain_synthetique_id', $terrainId)
                          ->orWhere('terrain_id', $terrainId);
                })
                ->whereIn('statut', ['confirmee', 'terminee'])
                ->exists();

            return response()->json([
                'success' => true,
                'data' => [
                    'can_review' => !$hasAvis && $hasReservations,
                    'has_review' => $hasAvis,
                    'has_reservations' => $hasReservations,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir l'avis de l'utilisateur connecté pour un terrain
     */
    public function myReview($terrainId): JsonResponse
    {
        try {
            $userId = Auth::id();
            $avis = AvisTerrain::where('user_id', $userId)
                ->where('terrain_id', $terrainId)
                ->first();

            if (!$avis) {
                return response()->json([
                    'success' => true,
                    'data' => null
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $avis->id,
                    'note' => $avis->note,
                    'commentaire' => $avis->commentaire,
                    'date' => $avis->created_at->format('Y-m-d H:i:s'),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

