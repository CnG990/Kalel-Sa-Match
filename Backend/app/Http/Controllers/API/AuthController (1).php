<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Connexion utilisateur
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
            'device_name' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->mot_de_passe)) {
            return response()->json([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        // Vérifier si l'utilisateur est actif
        if ($user->deleted_at) {
            return response()->json([
                'success' => false,
                'message' => 'Compte désactivé'
            ], 403);
        }

        // Créer un token
        $token = $user->createToken($request->device_name)->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'nom' => $user->nom,
                    'prenom' => $user->prenom,
                    'email' => $user->email,
                    'telephone' => $user->telephone,
                    'role' => $user->role,
                    'nom_complet' => $user->nom_complet,
                    'role_label' => $user->role_label,
                    'email_verified_at' => $user->email_verified_at,
                ],
                'token' => $token
            ]
        ]);
    }

    /**
     * Inscription utilisateur
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'telephone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:client,gestionnaire',
            'accept_terms' => 'required|accepted'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'mot_de_passe' => Hash::make($request->password),
            'role' => $request->role,
            'email_verified_at' => now(), // Auto-vérification pour simplifier
        ]);

        $token = $user->createToken('mobile_app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inscription réussie',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'nom' => $user->nom,
                    'prenom' => $user->prenom,
                    'email' => $user->email,
                    'telephone' => $user->telephone,
                    'role' => $user->role,
                    'nom_complet' => $user->nom_complet,
                    'role_label' => $user->role_label,
                ],
                'token' => $token
            ]
        ], 201);
    }

    /**
     * Informations utilisateur connecté
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'telephone' => $user->telephone,
                'role' => $user->role,
                'nom_complet' => $user->nom_complet,
                'role_label' => $user->role_label,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie'
        ]);
    }

    /**
     * Mise à jour du profil
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'telephone' => 'sometimes|required|string|max:20|unique:users,telephone,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['nom', 'prenom', 'telephone']));

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
                'nom_complet' => $user->nom_complet,
                'role_label' => $user->role_label,
            ]
        ]);
    }

    /**
     * Changement de mot de passe
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->mot_de_passe)) {
            return response()->json([
                'success' => false,
                'message' => 'Mot de passe actuel incorrect'
            ], 400);
        }

        $user->update([
            'mot_de_passe' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe mis à jour avec succès'
        ]);
    }

    /**
     * Mot de passe oublié
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Email invalide',
                'errors' => $validator->errors()
            ], 422);
        }

        // Ici, implémenter la logique d'envoi d'email de réinitialisation
        // Pour le moment, on retourne juste un succès

        return response()->json([
            'success' => true,
            'message' => 'Instructions de réinitialisation envoyées par email'
        ]);
    }

    /**
     * Réinitialisation du mot de passe
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        // Ici, implémenter la vérification du token de réinitialisation
        // Pour le moment, on simule un succès

        $user = User::where('email', $request->email)->first();
        $user->update([
            'mot_de_passe' => Hash::make($request->password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès'
        ]);
    }
} 