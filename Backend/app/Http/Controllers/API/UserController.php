<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Afficher le profil de l'utilisateur connecté
     */
    public function profile(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'nom' => $user->nom,
                    'prenom' => $user->prenom,
                    'email' => $user->email,
                    'telephone' => $user->telephone,
                    'role' => $user->role,
                    'slogan' => $user->slogan,
                    'profile_image_url' => $user->profile_image_url ? Storage::url($user->profile_image_url) : null,
                    'nom_complet' => $user->nom_complet ?? $user->prenom . ' ' . $user->nom,
                    'statut_validation' => $user->statut_validation ?? 'en_attente',
                    'nom_entreprise' => $user->nom_entreprise,
                    'numero_ninea' => $user->numero_ninea,
                    'numero_registre_commerce' => $user->numero_registre_commerce,
                    'adresse_entreprise' => $user->adresse_entreprise,
                    'adresse' => $user->adresse,
                    'description' => $user->description,
                    'created_at' => $user->created_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour le profil utilisateur
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            $validatedData = $request->validate([
                'nom' => 'sometimes|required|string|max:255',
                'prenom' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
                'telephone' => 'sometimes|string|max:20',
                'slogan' => 'nullable|string|max:100',
                'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                // Champs spécifiques gestionnaires
                'nom_entreprise' => 'nullable|string|max:255',
                'numero_ninea' => 'nullable|string|max:50',
                'numero_registre_commerce' => 'nullable|string|max:50',
                'adresse_entreprise' => 'nullable|string|max:500',
                'adresse' => 'nullable|string|max:500',
                'description' => 'nullable|string|max:1000',
            ]);

            if ($request->hasFile('profile_image')) {
                // Supprimer l'ancienne image si elle existe
                if ($user->profile_image_url) {
                    Storage::disk('public')->delete($user->profile_image_url);
                }
                
                $path = $request->file('profile_image')->store('profile-images', 'public');
                $validatedData['profile_image_url'] = $path;
                // Retirer profile_image du tableau car ce n'est pas un champ de la table
                unset($validatedData['profile_image']);
            }

            $user->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'data' => [
                    'id' => $user->id,
                    'nom' => $user->nom,
                    'prenom' => $user->prenom,
                    'email' => $user->email,
                    'telephone' => $user->telephone,
                    'role' => $user->role,
                    'slogan' => $user->slogan,
                    'profile_image_url' => $user->profile_image_url ? Storage::url($user->profile_image_url) : null,
                    'nom_complet' => $user->nom_complet ?? $user->prenom . ' ' . $user->nom,
                    'statut_validation' => $user->statut_validation ?? 'en_attente',
                    'nom_entreprise' => $user->nom_entreprise,
                    'numero_ninea' => $user->numero_ninea,
                    'numero_registre_commerce' => $user->numero_registre_commerce,
                    'adresse_entreprise' => $user->adresse_entreprise,
                    'adresse' => $user->adresse,
                    'description' => $user->description,
                    'created_at' => $user->created_at,
                ]
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
                'message' => 'Erreur lors de la mise à jour du profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les réservations de l'utilisateur
     */
    public function reservations(): JsonResponse
    {
        try {
            $reservations = Reservation::where('user_id', Auth::id())
                ->with(['terrain'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reservations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des réservations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les terrains favoris
     */
    public function favorites(): JsonResponse
    {
        try {
            // Pour l'instant, retournons un tableau vide
            // Cette fonctionnalité nécessite une table favorites
            return response()->json([
                'success' => true,
                'data' => []
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
     * Ajouter un terrain aux favoris
     */
    public function addFavorite(Request $request, $terrainId): JsonResponse
    {
        try {
            // Fonctionnalité à implémenter avec table favorites
            return response()->json([
                'success' => true,
                'message' => 'Terrain ajouté aux favoris'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout aux favoris',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retirer un terrain des favoris
     */
    public function removeFavorite($terrainId): JsonResponse
    {
        try {
            // Fonctionnalité à implémenter avec table favorites
            return response()->json([
                'success' => true,
                'message' => 'Terrain retiré des favoris'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression des favoris',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Routes Admin

    /**
     * Lister tous les utilisateurs (Admin)
     */
    public function index(): JsonResponse
    {
        try {
            $users = User::orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un utilisateur (Admin)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'telephone' => 'required|string|max:20',
                'role' => 'required|in:admin,gestionnaire,client',
                'mot_de_passe' => 'required|string|min:8',
            ]);

            $user = User::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'role' => $request->role,
                'mot_de_passe' => Hash::make($request->mot_de_passe),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès',
                'data' => $user
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
                'message' => 'Erreur lors de la création de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un utilisateur (Admin)
     */
    public function show($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur introuvable',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mettre à jour un utilisateur (Admin)
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            
            $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $id,
                'telephone' => 'required|string|max:20',
                'role' => 'required|in:admin,gestionnaire,client',
            ]);

            $user->update($request->only(['nom', 'prenom', 'email', 'telephone', 'role']));

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'data' => $user->fresh()
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
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un utilisateur (Admin)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistiques générales (Admin)
     */
    public function statsOverview(): JsonResponse
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'total_clients' => User::where('role', 'client')->count(),
                'total_gestionnaires' => User::where('role', 'gestionnaire')->count(),
                'total_admins' => User::where('role', 'admin')->count(),
                'new_users_today' => User::whereDate('created_at', today())->count(),
                'new_users_this_week' => User::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 