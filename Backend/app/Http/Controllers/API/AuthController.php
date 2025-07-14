<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

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
        ], [
            'email.required' => 'L\'adresse email est obligatoire',
            'email.email' => 'L\'adresse email doit être valide',
            'password.required' => 'Le mot de passe est obligatoire',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères',
            'device_name.required' => 'Le nom de l\'appareil est obligatoire'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $this->translateErrors($validator->errors())
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
        ], [
            'nom.required' => 'Le nom est obligatoire',
            'nom.string' => 'Le nom doit être une chaîne de caractères',
            'nom.max' => 'Le nom ne peut pas dépasser 255 caractères',
            'prenom.required' => 'Le prénom est obligatoire',
            'prenom.string' => 'Le prénom doit être une chaîne de caractères',
            'prenom.max' => 'Le prénom ne peut pas dépasser 255 caractères',
            'email.required' => 'L\'adresse email est obligatoire',
            'email.email' => 'L\'adresse email doit être valide',
            'email.unique' => 'Cette adresse email est déjà utilisée',
            'telephone.required' => 'Le numéro de téléphone est obligatoire',
            'telephone.string' => 'Le numéro de téléphone doit être une chaîne de caractères',
            'telephone.unique' => 'Ce numéro de téléphone est déjà utilisé',
            'password.required' => 'Le mot de passe est obligatoire',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas',
            'role.required' => 'Le rôle est obligatoire',
            'role.in' => 'Le rôle doit être client ou gestionnaire',
            'accept_terms.required' => 'Vous devez accepter les conditions d\'utilisation',
            'accept_terms.accepted' => 'Vous devez accepter les conditions d\'utilisation'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $this->translateErrors($validator->errors())
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
        ], [
            'nom.required' => 'Le nom est obligatoire',
            'nom.string' => 'Le nom doit être une chaîne de caractères',
            'nom.max' => 'Le nom ne peut pas dépasser 255 caractères',
            'prenom.required' => 'Le prénom est obligatoire',
            'prenom.string' => 'Le prénom doit être une chaîne de caractères',
            'prenom.max' => 'Le prénom ne peut pas dépasser 255 caractères',
            'telephone.required' => 'Le numéro de téléphone est obligatoire',
            'telephone.string' => 'Le numéro de téléphone doit être une chaîne de caractères',
            'telephone.unique' => 'Ce numéro de téléphone est déjà utilisé',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $this->translateErrors($validator->errors())
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
     * Envoyer un lien de réinitialisation de mot de passe
     */
    public function sendResetLink(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email'
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun utilisateur trouvé avec cette adresse email.'
                ], 404);
            }

            // Générer un token de réinitialisation
            $token = Str::random(60);
            
            // Stocker le token dans la base (table password_reset_tokens)
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now()
                ]
            );

            // Dans un environnement de production, vous enverriez l'email ici
            // Pour le développement, on retourne le token directement
            $resetUrl = config('app.frontend_url', 'http://127.0.0.1:5175') . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

            // Log pour développement
            \Log::info('Lien de réinitialisation généré', [
                'email' => $request->email,
                'token' => $token,
                'url' => $resetUrl
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Un lien de réinitialisation a été envoyé à votre adresse email.',
                'data' => [
                    'reset_url' => $resetUrl, // À retirer en production
                    'email' => $request->email
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erreur envoi lien réinitialisation:', [
                'email' => $request->email ?? 'N/A',
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi du lien de réinitialisation'
            ], 500);
        }
    }

    /**
     * Réinitialiser le mot de passe avec token
     */
    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
                'token' => 'required|string',
                'password' => 'required|string|min:8|confirmed'
            ]);

            // Vérifier le token
            $resetRecord = DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->first();

            if (!$resetRecord) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token de réinitialisation invalide ou expiré.'
                ], 400);
            }

            // Vérifier que le token correspond
            if (!Hash::check($request->token, $resetRecord->token)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token de réinitialisation invalide.'
                ], 400);
            }

            // Vérifier l'expiration (60 minutes)
            if (now()->diffInMinutes($resetRecord->created_at) > 60) {
                // Supprimer le token expiré
                DB::table('password_reset_tokens')->where('email', $request->email)->delete();
                
                return response()->json([
                    'success' => false,
                    'message' => 'Le token de réinitialisation a expiré. Veuillez faire une nouvelle demande.'
                ], 400);
            }

            // Mettre à jour le mot de passe
            $user = User::where('email', $request->email)->first();
            $user->update([
                'mot_de_passe' => Hash::make($request->password)
            ]);

            // Supprimer le token utilisé
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            \Log::info('Mot de passe réinitialisé avec succès', [
                'email' => $request->email,
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erreur réinitialisation mot de passe:', [
                'email' => $request->email ?? 'N/A',
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la réinitialisation du mot de passe'
            ], 500);
        }
    }

    /**
     * Traduire les erreurs de validation en français
     */
    private function translateErrors($errors)
    {
        $translatedErrors = [];
        
        foreach ($errors->toArray() as $field => $messages) {
            $translatedErrors[$field] = $messages;
        }
        
        return $translatedErrors;
    }
} 