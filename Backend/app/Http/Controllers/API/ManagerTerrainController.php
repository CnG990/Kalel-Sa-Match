<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TerrainSynthetiquesDakar;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ManagerTerrainController extends Controller
{
    /**
     * Obtenir les terrains du gestionnaire connecté
     */
    public function mesTerrains(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if ($user->role !== 'gestionnaire') {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $terrains = TerrainSynthetiquesDakar::where('gestionnaire_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $terrains
        ]);
    }

    /**
     * Créer un nouveau terrain pour le gestionnaire
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if ($user->role !== 'gestionnaire' || $user->statut_validation !== 'approuve') {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez être un gestionnaire validé pour ajouter un terrain'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'description' => 'required|string',
            'adresse' => 'required|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'capacite' => 'required|integer|min:10|max:50',
            'prix_heure' => 'required|numeric|min:5000|max:100000',
            'surface' => 'required|numeric|min:100',
            'horaires_ouverture' => 'required|string',
            'contact_telephone' => 'required|string|max:20',
            'equipements' => 'required|string|max:1000',
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $terrainData = $validator->validated();
            $terrainData['gestionnaire_id'] = $user->id;
            $terrainData['statut_validation'] = 'en_attente';
            $terrainData['est_actif'] = false; // Désactivé jusqu'à validation admin
            $terrainData['source_creation'] = 'gestionnaire';

            // Upload des images
            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('terrains/images', 'public');
                    $imagePaths[] = $path;
                }
            }
            $terrainData['images_supplementaires'] = $imagePaths;
            $terrainData['image_principale'] = $imagePaths[0] ?? '/terrain-foot.jpg';

            $terrain = TerrainSynthetiquesDakar::create($terrainData);

            return response()->json([
                'success' => true,
                'message' => 'Terrain créé avec succès. Il sera validé par notre équipe sous 48h.',
                'data' => $terrain
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du terrain',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier uniquement le prix et la capacité d'un terrain
     */
    public function updatePrixCapacite(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        $terrain = TerrainSynthetiquesDakar::findOrFail($id);

        if ($user->role !== 'gestionnaire' || $terrain->gestionnaire_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous pouvez seulement modifier vos propres terrains'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'prix_heure' => 'sometimes|numeric|min:5000|max:100000',
            'capacite' => 'sometimes|integer|min:10|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = [];
        $changes = [];

        if ($request->has('prix_heure')) {
            $updateData['prix_heure'] = $request->prix_heure;
            $changes[] = "Prix: {$terrain->prix_heure} → {$request->prix_heure} CFA/h";
        }

        if ($request->has('capacite')) {
            $updateData['capacite'] = $request->capacite;
            $changes[] = "Capacité: {$terrain->capacite} → {$request->capacite} joueurs";
        }

        $terrain->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Terrain mis à jour avec succès',
            'changes' => $changes,
            'data' => $terrain->fresh()
        ]);
    }

    /**
     * Obtenir les statistiques d'un terrain du gestionnaire
     */
    public function statistiques($id): JsonResponse
    {
        $user = Auth::user();
        $terrain = TerrainSynthetiquesDakar::findOrFail($id);

        if ($user->role !== 'gestionnaire' || $terrain->gestionnaire_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        // Récupérer les réservations pour ce terrain
        $reservations = \App\Models\Reservation::where('terrain_id', $id)
            ->where('statut', '!=', 'annulee')
            ->get();

        $stats = [
            'reservations_mois' => $reservations->filter(function($r) {
                return $r->created_at->isCurrentMonth();
            })->count(),
            'revenus_mois' => $reservations->filter(function($r) {
                return $r->created_at->isCurrentMonth() && $r->statut === 'confirmee';
            })->sum('montant_total'),
            'taux_occupation' => $this->calculerTauxOccupation($terrain, $reservations),
            'note_moyenne' => $terrain->note_moyenne ?? 0,
            'nombre_avis' => $terrain->nombre_avis ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'terrain' => $terrain->only(['id', 'nom', 'prix_heure', 'capacite']),
                'statistiques' => $stats
            ]
        ]);
    }

    /**
     * Calculer le taux d'occupation du terrain
     */
    private function calculerTauxOccupation($terrain, $reservations)
    {
        $now = now();
        $debutMois = $now->startOfMonth();
        $finMois = $now->copy()->endOfMonth();
        
        $reservationsMois = $reservations->filter(function($r) use ($debutMois, $finMois) {
            return $r->date_debut >= $debutMois && $r->date_debut <= $finMois;
        });

        $heuresReservees = $reservationsMois->sum('duree_heures');
        $heuresDisponibles = 30 * 12; // 30 jours * 12h par jour (estimation)
        
        return $heuresDisponibles > 0 ? ($heuresReservees / $heuresDisponibles) * 100 : 0;
    }

    /**
     * Activer/Désactiver un terrain (disponibilité)
     */
    public function toggleDisponibilite(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        $terrain = TerrainSynthetiquesDakar::findOrFail($id);

        if ($user->role !== 'gestionnaire' || $terrain->gestionnaire_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous pouvez seulement gérer vos propres terrains'
            ], 403);
        }

        $nouvelEtat = !$terrain->est_actif;
        $terrain->update(['est_actif' => $nouvelEtat]);

        return response()->json([
            'success' => true,
            'message' => $nouvelEtat ? 'Terrain activé avec succès' : 'Terrain désactivé avec succès',
            'data' => [
                'id' => $terrain->id,
                'est_actif' => $nouvelEtat,
                'statut' => $nouvelEtat ? 'Actif' : 'Inactif'
            ]
        ]);
    }

} 