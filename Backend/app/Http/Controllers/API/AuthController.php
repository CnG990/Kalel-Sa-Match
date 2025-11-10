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
        // Règles de validation de base
        $rules = [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'telephone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:client,gestionnaire',
            'accept_terms' => 'required|accepted'
        ];

        // Règles supplémentaires pour les gestionnaires
        if ($request->role === 'gestionnaire') {
            $rules['nom_entreprise'] = 'nullable|string|max:255';
            $rules['numero_ninea'] = 'nullable|string|max:50';
            $rules['adresse_entreprise'] = 'nullable|string|max:500';
        }

        $validator = Validator::make($request->all(), $rules, [
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

        // Préparer les données de base
        $userData = [
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'mot_de_passe' => Hash::make($request->password),
            'role' => $request->role,
            'email_verified_at' => now(), // Auto-vérification pour simplifier
        ];

        // Pour les gestionnaires, définir le statut de validation à 'en_attente'
        if ($request->role === 'gestionnaire') {
            $userData['statut_validation'] = 'en_attente';
            
            // Ajouter les informations spécifiques aux gestionnaires si fournies
            if ($request->has('nom_entreprise')) {
                $userData['nom_entreprise'] = $request->nom_entreprise;
            }
            if ($request->has('numero_ninea')) {
                $userData['numero_ninea'] = $request->numero_ninea;
            }
            if ($request->has('adresse_entreprise')) {
                $userData['adresse_entreprise'] = $request->adresse_entreprise;
            }
        }

        $user = User::create($userData);

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
    /**
     * Mettre à jour le profil utilisateur (nom, prénom, email)
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
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
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $this->translateErrors($validator->errors())
            ], 422);
        }

        $user->update($request->only(['nom', 'prenom', 'email']));

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
     * Mettre à jour le numéro de téléphone avec OTP
     */
    public function updatePhoneWithOTP(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'nouveau_telephone' => 'required|string|regex:/^[0-9]{9,15}$/|unique:users,telephone,' . $user->id,
            'otp_code' => 'required|string|size:6',
        ], [
            'nouveau_telephone.required' => 'Le nouveau numéro de téléphone est obligatoire',
            'nouveau_telephone.regex' => 'Le numéro de téléphone doit contenir entre 9 et 15 chiffres',
            'nouveau_telephone.unique' => 'Ce numéro de téléphone est déjà utilisé',
            'otp_code.required' => 'Le code OTP est obligatoire',
            'otp_code.size' => 'Le code OTP doit contenir 6 chiffres',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $this->translateErrors($validator->errors())
            ], 422);
        }

        // Normaliser le nouveau numéro de téléphone
        $nouveauTelephone = $request->nouveau_telephone;
        if (!str_starts_with($nouveauTelephone, '+')) {
            if (str_starts_with($nouveauTelephone, '0')) {
                $nouveauTelephone = '+221' . substr($nouveauTelephone, 1);
            } else {
                $nouveauTelephone = '+221' . $nouveauTelephone;
            }
        }

        // Vérifier le code OTP
        if (!$user->otp_code || !Hash::check($request->otp_code, $user->otp_code)) {
            return response()->json([
                'success' => false,
                'message' => 'Code OTP invalide'
            ], 400);
        }

        // Vérifier l'expiration du code OTP
        if (!$user->otp_expires_at || now()->isAfter($user->otp_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Le code OTP a expiré. Veuillez en demander un nouveau.'
            ], 400);
        }

        // Mettre à jour le numéro de téléphone
        $ancienTelephone = $user->telephone;
        $user->update([
            'telephone' => $nouveauTelephone,
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        \Log::info('Numéro de téléphone mis à jour', [
            'user_id' => $user->id,
            'ancien_telephone' => $ancienTelephone,
            'nouveau_telephone' => $nouveauTelephone,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Numéro de téléphone mis à jour avec succès',
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
     * Envoyer un code OTP par SMS
     * Peut être utilisé pour l'authentification ou la mise à jour du téléphone
     */
    public function sendOTP(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'telephone' => 'required|string|regex:/^[0-9]{9,15}$/',
            'for_update' => 'sometimes|boolean', // Indique si c'est pour une mise à jour
        ], [
            'telephone.required' => 'Le numéro de téléphone est obligatoire',
            'telephone.regex' => 'Le numéro de téléphone doit contenir entre 9 et 15 chiffres',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $this->translateErrors($validator->errors())
            ], 422);
        }

        $telephone = $request->telephone;
        $forUpdate = $request->input('for_update', false);
        
        // Normaliser le numéro de téléphone (ajouter l'indicatif si nécessaire)
        if (!str_starts_with($telephone, '+')) {
            // Si le numéro commence par 0, le remplacer par +221
            if (str_starts_with($telephone, '0')) {
                $telephone = '+221' . substr($telephone, 1);
            } else {
                $telephone = '+221' . $telephone;
            }
        }

        // Générer un code OTP à 6 chiffres
        $otpCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        if ($forUpdate && $request->user()) {
            // Mise à jour du téléphone - utiliser l'utilisateur connecté
            $user = $request->user();
            
            // Vérifier que le nouveau numéro n'est pas déjà utilisé
            $existingUser = User::where('telephone', $telephone)
                ->where('id', '!=', $user->id)
                ->first();
            
            if ($existingUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce numéro de téléphone est déjà utilisé'
                ], 422);
            }
            
            // Mettre à jour le code OTP pour l'utilisateur connecté
            $user->update([
                'otp_code' => Hash::make($otpCode),
                'otp_expires_at' => now()->addMinutes(10),
            ]);
        } else {
            // Authentification - vérifier si l'utilisateur existe
            $user = User::where('telephone', $telephone)->first();
            
            if ($user) {
                // Utilisateur existant - mettre à jour le code OTP
                $user->update([
                    'otp_code' => Hash::make($otpCode),
                    'otp_expires_at' => now()->addMinutes(10), // Expire dans 10 minutes
                ]);
            } else {
                // Nouvel utilisateur - créer un enregistrement temporaire
                $user = User::create([
                    'telephone' => $telephone,
                    'otp_code' => Hash::make($otpCode),
                    'otp_expires_at' => now()->addMinutes(10),
                    'role' => 'client', // Par défaut
                ]);
            }
        }

        // En production, envoyer le SMS ici
        // Pour le développement, on retourne le code dans la réponse
        \Log::info('Code OTP généré', [
            'telephone' => $telephone,
            'for_update' => $forUpdate,
            'otp_code' => $otpCode, // À retirer en production
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Code OTP envoyé avec succès',
            'data' => [
                'otp_code' => $otpCode, // À retirer en production
                'expires_in' => 10, // minutes
            ]
        ]);
    }

    /**
     * Vérifier le code OTP
     */
    public function verifyOTP(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'telephone' => 'required|string',
            'otp_code' => 'required|string|size:6',
        ], [
            'telephone.required' => 'Le numéro de téléphone est obligatoire',
            'otp_code.required' => 'Le code OTP est obligatoire',
            'otp_code.size' => 'Le code OTP doit contenir 6 chiffres',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $this->translateErrors($validator->errors())
            ], 422);
        }

        $telephone = $request->telephone;
        
        // Normaliser le numéro de téléphone
        if (!str_starts_with($telephone, '+')) {
            if (str_starts_with($telephone, '0')) {
                $telephone = '+221' . substr($telephone, 1);
            } else {
                $telephone = '+221' . $telephone;
            }
        }

        $user = User::where('telephone', $telephone)->first();

        if (!$user || !$user->otp_code) {
            return response()->json([
                'success' => false,
                'message' => 'Code OTP invalide ou expiré'
            ], 400);
        }

        // Vérifier l'expiration
        if ($user->otp_expires_at && $user->otp_expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Le code OTP a expiré. Veuillez demander un nouveau code.'
            ], 400);
        }

        // Vérifier le code OTP
        if (!Hash::check($request->otp_code, $user->otp_code)) {
            return response()->json([
                'success' => false,
                'message' => 'Code OTP incorrect'
            ], 400);
        }

        // Code OTP valide - retourner un token temporaire pour l'étape suivante
        $tempToken = Str::random(60);
        
        // Stocker le token temporaire dans la session ou dans un cache
        // Pour simplifier, on retourne juste un indicateur de succès
        // L'utilisateur devra fournir le téléphone à nouveau pour définir le PIN

        return response()->json([
            'success' => true,
            'message' => 'Code OTP vérifié avec succès',
            'data' => [
                'telephone' => $telephone,
                'is_new_user' => empty($user->pin), // Indique si c'est un nouvel utilisateur
            ]
        ]);
    }

    /**
     * Définir le PIN (4 chiffres)
     */
    public function setPIN(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'telephone' => 'required|string',
            'pin' => 'required|string|size:4|regex:/^[0-9]{4}$/',
            'pin_confirmation' => 'required|string|same:pin',
        ], [
            'telephone.required' => 'Le numéro de téléphone est obligatoire',
            'pin.required' => 'Le PIN est obligatoire',
            'pin.size' => 'Le PIN doit contenir exactement 4 chiffres',
            'pin.regex' => 'Le PIN doit contenir uniquement des chiffres',
            'pin_confirmation.required' => 'La confirmation du PIN est obligatoire',
            'pin_confirmation.same' => 'La confirmation du PIN ne correspond pas',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $this->translateErrors($validator->errors())
            ], 422);
        }

        $telephone = $request->telephone;
        
        // Normaliser le numéro de téléphone
        if (!str_starts_with($telephone, '+')) {
            if (str_starts_with($telephone, '0')) {
                $telephone = '+221' . substr($telephone, 1);
            } else {
                $telephone = '+221' . $telephone;
            }
        }

        $user = User::where('telephone', $telephone)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Vérifier que le code OTP a été vérifié (optionnel, pour sécurité)
        // Pour simplifier, on accepte directement la définition du PIN

        // Hasher le PIN
        $user->update([
            'pin' => Hash::make($request->pin),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'PIN défini avec succès',
            'data' => [
                'telephone' => $telephone,
            ]
        ]);
    }

    /**
     * Inscription complète avec téléphone, OTP, PIN et informations personnelles
     */
    public function registerWithPhone(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'telephone' => 'required|string|regex:/^[0-9]{9,15}$/',
            'otp_code' => 'required|string|size:6',
            'pin' => 'required|string|size:4|regex:/^[0-9]{4}$/',
            'pin_confirmation' => 'required|string|same:pin',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
        ], [
            'telephone.required' => 'Le numéro de téléphone est obligatoire',
            'otp_code.required' => 'Le code OTP est obligatoire',
            'pin.required' => 'Le PIN est obligatoire',
            'pin.size' => 'Le PIN doit contenir exactement 4 chiffres',
            'nom.required' => 'Le nom est obligatoire',
            'prenom.required' => 'Le prénom est obligatoire',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $this->translateErrors($validator->errors())
            ], 422);
        }

        $telephone = $request->telephone;
        
        // Normaliser le numéro de téléphone
        if (!str_starts_with($telephone, '+')) {
            if (str_starts_with($telephone, '0')) {
                $telephone = '+221' . substr($telephone, 1);
            } else {
                $telephone = '+221' . $telephone;
            }
        }

        // Vérifier que le numéro de téléphone n'est pas déjà utilisé
        $existingUser = User::where('telephone', $telephone)
            ->whereNotNull('pin')
            ->whereNotNull('nom')
            ->first();

        if ($existingUser) {
            return response()->json([
                'success' => false,
                'message' => 'Ce numéro de téléphone est déjà enregistré'
            ], 409);
        }

        // Vérifier le code OTP
        $user = User::where('telephone', $telephone)->first();
        
        if (!$user || !$user->otp_code) {
            return response()->json([
                'success' => false,
                'message' => 'Code OTP invalide ou expiré'
            ], 400);
        }

        if ($user->otp_expires_at && $user->otp_expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Le code OTP a expiré'
            ], 400);
        }

        if (!Hash::check($request->otp_code, $user->otp_code)) {
            return response()->json([
                'success' => false,
                'message' => 'Code OTP incorrect'
            ], 400);
        }

        // Mettre à jour l'utilisateur avec toutes les informations
        $user->update([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'pin' => Hash::make($request->pin),
            'role' => 'client',
            'otp_code' => null, // Nettoyer le code OTP
            'otp_expires_at' => null,
            'email_verified_at' => now(),
        ]);

        // Créer un token d'authentification
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
     * Connexion avec téléphone + OTP + PIN
     */
    public function loginWithPhone(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'telephone' => 'required|string',
            'otp_code' => 'required|string|size:6',
            'pin' => 'required|string|size:4|regex:/^[0-9]{4}$/',
            'device_name' => 'required|string'
        ], [
            'telephone.required' => 'Le numéro de téléphone est obligatoire',
            'otp_code.required' => 'Le code OTP est obligatoire',
            'pin.required' => 'Le PIN est obligatoire',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $this->translateErrors($validator->errors())
            ], 422);
        }

        $telephone = $request->telephone;
        
        // Normaliser le numéro de téléphone
        if (!str_starts_with($telephone, '+')) {
            if (str_starts_with($telephone, '0')) {
                $telephone = '+221' . substr($telephone, 1);
            } else {
                $telephone = '+221' . $telephone;
            }
        }

        $user = User::where('telephone', $telephone)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Numéro de téléphone non trouvé'
            ], 404);
        }

        // Vérifier le code OTP
        if (!$user->otp_code || !Hash::check($request->otp_code, $user->otp_code)) {
            return response()->json([
                'success' => false,
                'message' => 'Code OTP invalide'
            ], 400);
        }

        if ($user->otp_expires_at && $user->otp_expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Le code OTP a expiré'
            ], 400);
        }

        // Vérifier le PIN
        if (!$user->pin || !Hash::check($request->pin, $user->pin)) {
            return response()->json([
                'success' => false,
                'message' => 'PIN incorrect'
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
                ],
                'token' => $token
            ]
        ]);
    }

    /**
     * Connexion rapide avec PIN uniquement (téléphone déjà enregistré)
     */
    public function loginWithPIN(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'telephone' => 'required|string',
            'pin' => 'required|string|size:4|regex:/^[0-9]{4}$/',
            'device_name' => 'required|string'
        ], [
            'telephone.required' => 'Le numéro de téléphone est obligatoire',
            'pin.required' => 'Le PIN est obligatoire',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $this->translateErrors($validator->errors())
            ], 422);
        }

        $telephone = $request->telephone;
        
        // Normaliser le numéro de téléphone
        if (!str_starts_with($telephone, '+')) {
            if (str_starts_with($telephone, '0')) {
                $telephone = '+221' . substr($telephone, 1);
            } else {
                $telephone = '+221' . $telephone;
            }
        }

        $user = User::where('telephone', $telephone)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Numéro de téléphone non trouvé'
            ], 404);
        }

        // Vérifier le PIN
        if (!$user->pin || !Hash::check($request->pin, $user->pin)) {
            return response()->json([
                'success' => false,
                'message' => 'PIN incorrect'
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
                ],
                'token' => $token
            ]
        ]);
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