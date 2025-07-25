<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LitigeController extends Controller
{
    /**
     * Créer un nouveau litige
     */
    public function creerLitige(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'terrain_id' => 'required|exists:terrains_synthetiques_dakar,id',
                'type_litige' => 'required|in:reservation,paiement,service,equipement,autre',
                'sujet' => 'required|string|max:255',
                'description' => 'required|string|max:2000',
                'priorite' => 'required|in:faible,normale,elevee,urgente',
                'reservation_id' => 'nullable|exists:reservations,id',
                'preuves' => 'nullable|array'
            ]);

            $userId = Auth::id();
            
            // Générer un numéro de litige unique
            $numeroLitige = $this->genererNumeroLitige();

            $litige = DB::table('litiges')->insertGetId([
                'numero_litige' => $numeroLitige,
                'user_id' => $userId,
                'terrain_id' => $request->terrain_id,
                'reservation_id' => $request->reservation_id,
                'type_litige' => $request->type_litige,
                'sujet' => $request->sujet,
                'description' => $request->description,
                'priorite' => $request->priorite,
                'statut' => 'nouveau',
                'niveau_escalade' => 'client',
                'preuves' => json_encode($request->preuves ?? []),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Créer le premier message du client
            DB::table('messages_litige')->insert([
                'litige_id' => $litige,
                'user_id' => $userId,
                'role_expediteur' => 'client',
                'message' => $request->description,
                'type_message' => 'probleme_initial',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Notifier le gestionnaire du terrain
            $this->notifierNouveauLitige($litige, $request->terrain_id);

            return response()->json([
                'success' => true,
                'message' => 'Litige créé avec succès',
                'data' => [
                    'litige_id' => $litige,
                    'numero_litige' => $numeroLitige,
                    'statut' => 'nouveau',
                    'delai_reponse_estime' => '2 heures ouvrées'
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du litige',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les litiges de l'utilisateur connecté
     */
    public function mesLitiges(): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            $litiges = DB::table('litiges')
                ->join('terrains_synthetiques_dakar', 'litiges.terrain_id', '=', 'terrains_synthetiques_dakar.id')
                ->leftJoin('reservations', 'litiges.reservation_id', '=', 'reservations.id')
                ->where('litiges.user_id', $userId)
                ->select([
                    'litiges.*',
                    'terrains_synthetiques_dakar.nom as terrain_nom',
                    'reservations.date_debut',
                    'reservations.date_fin'
                ])
                ->orderBy('litiges.created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $litiges
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des litiges',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les détails d'un litige avec l'historique des messages
     */
    public function detailsLitige($id): JsonResponse
    {
        try {
            $userId = Auth::id();
            $userRole = Auth::user()->role;

            // Récupérer le litige
            $litige = DB::table('litiges')
                ->join('terrains_synthetiques_dakar', 'litiges.terrain_id', '=', 'terrains_synthetiques_dakar.id')
                ->leftJoin('reservations', 'litiges.reservation_id', '=', 'reservations.id')
                ->leftJoin('users as client', 'litiges.user_id', '=', 'client.id')
                ->where('litiges.id', $id)
                ->select([
                    'litiges.*',
                    'terrains_synthetiques_dakar.nom as terrain_nom',
                    'terrains_synthetiques_dakar.gestionnaire_id',
                    'reservations.date_debut',
                    'reservations.date_fin',
                    'client.nom as client_nom',
                    'client.email as client_email'
                ])
                ->first();

            if (!$litige) {
                return response()->json([
                    'success' => false,
                    'message' => 'Litige non trouvé'
                ], 404);
            }

            // Vérifier les droits d'accès
            if (!$this->peutAccederLitige($userId, $userRole, $litige)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Récupérer l'historique des messages
            $messages = DB::table('messages_litige')
                ->join('users', 'messages_litige.user_id', '=', 'users.id')
                ->where('messages_litige.litige_id', $id)
                ->select([
                    'messages_litige.*',
                    'users.nom as expediteur_nom',
                    'users.role as expediteur_role'
                ])
                ->orderBy('messages_litige.created_at', 'asc')
                ->get();

            // Marquer les messages comme lus
            DB::table('messages_litige')
                ->where('litige_id', $id)
                ->where('user_id', '!=', $userId)
                ->where('lu', false)
                ->update(['lu' => true, 'lu_at' => now()]);

            return response()->json([
                'success' => true,
                'data' => [
                    'litige' => $litige,
                    'messages' => $messages,
                    'peut_repondre' => $this->peutRepondre($userId, $userRole, $litige),
                    'peut_escalader' => $this->peutEscalader($userId, $userRole, $litige),
                    'peut_fermer' => $this->peutFermer($userId, $userRole, $litige)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du litige',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ajouter un message à un litige
     */
    public function ajouterMessage(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'message' => 'required|string|max:2000',
                'type_message' => 'required|in:reponse,escalade,resolution,information',
                'pieces_jointes' => 'nullable|array'
            ]);

            $userId = Auth::id();
            $userRole = Auth::user()->role;

            $litige = DB::table('litiges')->where('id', $id)->first();
            if (!$litige) {
                return response()->json([
                    'success' => false,
                    'message' => 'Litige non trouvé'
                ], 404);
            }

            if (!$this->peutRepondre($userId, $userRole, $litige)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à répondre à ce litige'
                ], 403);
            }

            // Ajouter le message
            DB::table('messages_litige')->insert([
                'litige_id' => $id,
                'user_id' => $userId,
                'role_expediteur' => $userRole,
                'message' => $request->message,
                'type_message' => $request->type_message,
                'pieces_jointes' => json_encode($request->pieces_jointes ?? []),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Mettre à jour le statut du litige selon le type de message
            $nouveauStatut = $this->determinerNouveauStatut($litige->statut, $userRole, $request->type_message);
            if ($nouveauStatut !== $litige->statut) {
                DB::table('litiges')
                    ->where('id', $id)
                    ->update([
                        'statut' => $nouveauStatut,
                        'updated_at' => now()
                    ]);
            }

            // Notifier les parties concernées
            $this->notifierNouveauMessage($id, $userId, $userRole);

            return response()->json([
                'success' => true,
                'message' => 'Message ajouté avec succès',
                'data' => [
                    'nouveau_statut' => $nouveauStatut
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout du message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Escalader un litige au niveau supérieur
     */
    public function escaladerLitige($id): JsonResponse
    {
        try {
            $userId = Auth::id();
            $userRole = Auth::user()->role;

            $litige = DB::table('litiges')->where('id', $id)->first();
            if (!$litige) {
                return response()->json([
                    'success' => false,
                    'message' => 'Litige non trouvé'
                ], 404);
            }

            if (!$this->peutEscalader($userId, $userRole, $litige)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas escalader ce litige'
                ], 403);
            }

            $nouveauNiveau = $this->obtenirNiveauEscaladeSuivant($litige->niveau_escalade);
            
            DB::table('litiges')
                ->where('id', $id)
                ->update([
                    'niveau_escalade' => $nouveauNiveau,
                    'statut' => 'escalade',
                    'date_escalade' => now(),
                    'updated_at' => now()
                ]);

            // Ajouter un message automatique d'escalade
            DB::table('messages_litige')->insert([
                'litige_id' => $id,
                'user_id' => $userId,
                'role_expediteur' => $userRole,
                'message' => "Ce litige a été escaladé au niveau {$nouveauNiveau} pour une résolution plus rapide.",
                'type_message' => 'escalade',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Notifier le niveau supérieur
            $this->notifierEscalade($id, $nouveauNiveau);

            return response()->json([
                'success' => true,
                'message' => 'Litige escaladé avec succès',
                'data' => [
                    'nouveau_niveau' => $nouveauNiveau,
                    'delai_reponse_estime' => $this->obtenirDelaiReponse($nouveauNiveau)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'escalade du litige',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fermer un litige
     */
    public function fermerLitige(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'resolution' => 'required|string|max:1000',
                'satisfaction_client' => 'nullable|in:1,2,3,4,5'
            ]);

            $userId = Auth::id();
            $userRole = Auth::user()->role;

            $litige = DB::table('litiges')->where('id', $id)->first();
            if (!$litige) {
                return response()->json([
                    'success' => false,
                    'message' => 'Litige non trouvé'
                ], 404);
            }

            if (!$this->peutFermer($userId, $userRole, $litige)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas fermer ce litige'
                ], 403);
            }

            // Fermer le litige
            DB::table('litiges')
                ->where('id', $id)
                ->update([
                    'statut' => 'ferme',
                    'resolution' => $request->resolution,
                    'satisfaction_client' => $request->satisfaction_client,
                    'ferme_par' => $userId,
                    'date_fermeture' => now(),
                    'updated_at' => now()
                ]);

            // Ajouter un message de résolution
            DB::table('messages_litige')->insert([
                'litige_id' => $id,
                'user_id' => $userId,
                'role_expediteur' => $userRole,
                'message' => "Litige fermé. Résolution : " . $request->resolution,
                'type_message' => 'resolution',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Litige fermé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la fermeture du litige',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Méthodes privées utilitaires

    private function genererNumeroLitige(): string
    {
        return 'LIT-' . date('Y') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
    }

    private function peutAccederLitige($userId, $userRole, $litige): bool
    {
        if ($userRole === 'admin') return true;
        if ($litige->user_id == $userId) return true;
        if ($userRole === 'gestionnaire' && $litige->gestionnaire_id == $userId) return true;
        return false;
    }

    private function peutRepondre($userId, $userRole, $litige): bool
    {
        if ($litige->statut === 'ferme') return false;
        return $this->peutAccederLitige($userId, $userRole, $litige);
    }

    private function peutEscalader($userId, $userRole, $litige): bool
    {
        if ($litige->statut === 'ferme') return false;
        if ($userRole === 'admin') return false; // Admin est le niveau maximum
        if ($litige->user_id == $userId) return true; // Client peut toujours escalader
        return false;
    }

    private function peutFermer($userId, $userRole, $litige): bool
    {
        if ($litige->statut === 'ferme') return false;
        if ($userRole === 'admin') return true;
        if ($userRole === 'gestionnaire' && $litige->gestionnaire_id == $userId) return true;
        return false;
    }

    private function determinerNouveauStatut($statutActuel, $roleRepondeur, $typeMessage): string
    {
        switch ($typeMessage) {
            case 'reponse':
                return $roleRepondeur === 'client' ? 'en_attente_reponse' : 'en_cours';
            case 'escalade':
                return 'escalade';
            case 'resolution':
                return 'resolu';
            default:
                return $statutActuel;
        }
    }

    private function obtenirNiveauEscaladeSuivant($niveauActuel): string
    {
        switch ($niveauActuel) {
            case 'client': return 'gestionnaire';
            case 'gestionnaire': return 'admin';
            default: return 'admin';
        }
    }

    private function obtenirDelaiReponse($niveau): string
    {
        switch ($niveau) {
            case 'gestionnaire': return '4 heures ouvrées';
            case 'admin': return '24 heures ouvrées';
            default: return '2 heures ouvrées';
        }
    }

    private function notifierNouveauLitige($litigeId, $terrainId): void
    {
        // Implémentation des notifications (email, push, etc.)
        // À développer selon les besoins
    }

    private function notifierNouveauMessage($litigeId, $expediteurId, $roleExpediteur): void
    {
        // Implémentation des notifications
    }

    private function notifierEscalade($litigeId, $nouveauNiveau): void
    {
        // Implémentation des notifications d'escalade
    }
} 