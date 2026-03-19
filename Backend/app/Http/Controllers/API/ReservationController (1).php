<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Terrain;
use App\Models\TerrainSynthetiquesDakar;
use App\Models\Paiement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    /**
     * Liste des réservations de l'utilisateur connecté
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Reservation::with(['terrain.terrainSynthetique'])
            ->where('user_id', $user->id);

        // Filtres
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('periode')) {
            $periode = $request->periode;
            switch ($periode) {
                case 'upcoming':
                    $query->upcoming();
                    break;
                case 'past':
                    $query->past();
                    break;
                case 'today':
                    $query->today();
                    break;
                case 'this_week':
                    $query->thisWeek();
                    break;
                case 'this_month':
                    $query->thisMonth();
                    break;
            }
        }

        $reservations = $query->orderBy('date_debut', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => [
                'reservations' => $reservations->items(),
                'pagination' => [
                    'current_page' => $reservations->currentPage(),
                    'last_page' => $reservations->lastPage(),
                    'per_page' => $reservations->perPage(),
                    'total' => $reservations->total(),
                ]
            ]
        ]);
    }

    /**
     * Mes réservations - Version simplifiée pour le frontend
     */
    public function myReservations(Request $request)
    {
        $user = $request->user();
        
        $reservations = Reservation::with(['terrain'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reservations
        ]);
    }

    /**
     * Créer une nouvelle réservation
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'terrain_id' => 'required|exists:terrains_synthetiques_dakar,id',
            'date_debut' => 'required|date|after:now',
            'duree_heures' => 'required|numeric|min:1|max:8',
            'notes' => 'sometimes|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $terrain = TerrainSynthetiquesDakar::find($request->terrain_id);
        $dateDebut = \Carbon\Carbon::parse($request->date_debut);
        $dateFin = $dateDebut->copy()->addHours($request->duree_heures);

        // Vérifier la disponibilité
        $conflict = Reservation::where('terrain_id', $request->terrain_id)
            ->whereIn('statut', ['en_attente', 'confirmee'])
            ->where(function ($query) use ($dateDebut, $dateFin) {
                $query->whereBetween('date_debut', [$dateDebut, $dateFin])
                      ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
                      ->orWhere(function ($q) use ($dateDebut, $dateFin) {
                          $q->where('date_debut', '<=', $dateDebut)
                            ->where('date_fin', '>=', $dateFin);
                      });
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => 'Créneau non disponible pour cette période'
            ], 409);
        }

        // Calculer le montant
        $montantTotal = $terrain->prix_heure * $request->duree_heures;

        // Créer la réservation
        $reservation = Reservation::create([
            'terrain_id' => $request->terrain_id,
            'user_id' => $user->id,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'montant_total' => $montantTotal,
            'statut' => 'en_attente',
            'notes' => $request->notes
        ]);

        // Créer un enregistrement de paiement en attente
        $paiement = Paiement::create([
            'user_id' => $user->id,
            'payable_id' => $reservation->id,
            'payable_type' => Reservation::class,
            'reference_transaction' => Paiement::generateReference(),
            'montant' => $montantTotal,
            'methode' => 'en_attente',
            'statut' => 'en_attente'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Réservation créée avec succès',
            'data' => [
                'reservation' => $reservation->load(['terrain']),
                'paiement' => $paiement
            ]
        ], 201);
    }

    /**
     * Détails d'une réservation
     */
    public function show($id)
    {
        $reservation = Reservation::with(['terrain.terrainSynthetique', 'user', 'paiements'])
            ->find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation non trouvée'
            ], 404);
        }

        // Vérifier que l'utilisateur a accès à cette réservation
        $user = request()->user();
        if ($reservation->user_id !== $user->id && !$user->hasAnyRole(['admin', 'gestionnaire'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $reservation
        ]);
    }

    /**
     * Annuler une réservation
     */
    public function cancel($id, Request $request)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation non trouvée'
            ], 404);
        }

        $user = $request->user();
        if ($reservation->user_id !== $user->id && !$user->hasAnyRole(['admin', 'gestionnaire'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        try {
            $reservation->cancel($request->reason);
            
            return response()->json([
                'success' => true,
                'message' => 'Réservation annulée avec succès',
                'data' => $reservation->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Confirmer une réservation (pour gestionnaires)
     */
    public function confirm($id, Request $request)
    {
        $user = $request->user();
        
        if (!$user->hasAnyRole(['admin', 'gestionnaire'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation non trouvée'
            ], 404);
        }

        try {
            $reservation->confirm();
            
            return response()->json([
                'success' => true,
                'message' => 'Réservation confirmée avec succès',
                'data' => $reservation->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Vérifier la disponibilité d'un créneau
     */
    public function checkAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'terrain_id' => 'required|exists:terrains_synthetiques_dakar,id',
            'date_debut' => 'required|date|after:now',
            'duree_heures' => 'required|numeric|min:1|max:8'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $dateDebut = \Carbon\Carbon::parse($request->date_debut);
        $dateFin = $dateDebut->copy()->addHours($request->duree_heures);

        $conflict = Reservation::where('terrain_id', $request->terrain_id)
            ->whereIn('statut', ['en_attente', 'confirmee'])
            ->where(function ($query) use ($dateDebut, $dateFin) {
                $query->whereBetween('date_debut', [$dateDebut, $dateFin])
                      ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
                      ->orWhere(function ($q) use ($dateDebut, $dateFin) {
                          $q->where('date_debut', '<=', $dateDebut)
                            ->where('date_fin', '>=', $dateFin);
                      });
            })
            ->exists();

        return response()->json([
            'success' => true,
            'data' => [
                'disponible' => !$conflict,
                'date_debut' => $dateDebut->toISOString(),
                'date_fin' => $dateFin->toISOString(),
                'message' => $conflict ? 'Créneau non disponible' : 'Créneau disponible'
            ]
        ]);
    }
} 