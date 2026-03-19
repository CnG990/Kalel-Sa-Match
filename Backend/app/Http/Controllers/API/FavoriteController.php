<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\TerrainSynthetiquesDakar;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * Lister les favoris de l'utilisateur
     */
    public function index(): JsonResponse
    {
        try {
            $favorites = Favorite::forUser(Auth::id())
                ->with(['terrain'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($favorite) {
                    $terrain = $favorite->terrain;
                    return [
                        'id' => $favorite->id,
                        'terrain_id' => $terrain->id,
                        'terrain' => [
                            'id' => $terrain->id,
                            'nom' => $terrain->nom,
                            'adresse' => $terrain->adresse,
                            'prix_heure' => $terrain->prix_heure,
                            'latitude' => $terrain->latitude,
                            'longitude' => $terrain->longitude,
                            'image_principale' => $terrain->image_principale,
                            'est_actif' => $terrain->est_actif
                        ],
                        'added_at' => $favorite->created_at
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $favorites
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des favoris',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ajouter/retirer un terrain des favoris (toggle)
     */
    public function toggle(Request $request, $terrainId): JsonResponse
    {
        try {
            // Vérifier que le terrain existe
            $terrain = TerrainSynthetiquesDakar::findOrFail($terrainId);
            
            $result = Favorite::toggle(Auth::id(), $terrainId);

            return response()->json([
                'success' => true,
                'message' => $result['action'] === 'added' ? 'Terrain ajouté aux favoris' : 'Terrain retiré des favoris',
                'data' => [
                    'is_favorite' => $result['is_favorite'],
                    'action' => $result['action'],
                    'terrain_id' => $terrainId
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification des favoris',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier si un terrain est en favori
     */
    public function check($terrainId): JsonResponse
    {
        try {
            $isFavorite = Favorite::isFavorite(Auth::id(), $terrainId);

            return response()->json([
                'success' => true,
                'data' => [
                    'is_favorite' => $isFavorite,
                    'terrain_id' => $terrainId
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
     * Supprimer un favori spécifique
     */
    public function destroy($favoriteId): JsonResponse
    {
        try {
            $favorite = Favorite::forUser(Auth::id())->findOrFail($favoriteId);
            $favorite->delete();

            return response()->json([
                'success' => true,
                'message' => 'Favori supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 