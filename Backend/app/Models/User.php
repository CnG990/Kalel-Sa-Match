<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'mot_de_passe',
        'telephone',
        'role',
        'statut_validation',
        'nom_entreprise',
        'numero_ninea',
        'numero_registre_commerce',
        'adresse_entreprise',
        'documents_legaux',
        'taux_commission_defaut',
        'email_verified_at',
        'slogan',
        'profile_image_url',
        'pin',
        'otp_code',
        'otp_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'mot_de_passe',
        'remember_token',
        'pin',
        'otp_code',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_validation' => 'datetime',
            'mot_de_passe' => 'hashed',
            'documents_legaux' => 'array',
            'taux_commission_defaut' => 'decimal:2',
            'otp_expires_at' => 'datetime',
        ];
    }

    /**
     * Spécifier le nom de la colonne password pour l'authentification
     */
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    /**
     * Accesseur pour le nom complet
     */
    public function getNomCompletAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }

    /**
     * Accesseur pour le label du rôle
     */
    public function getRoleLabelAttribute(): string
    {
        return match($this->role) {
            'admin' => 'Administrateur',
            'gestionnaire' => 'Gestionnaire de terrain',
            'client' => 'Client',
            default => 'Utilisateur'
        };
    }

    /**
     * Accesseur pour le label du statut de validation
     */
    public function getStatutValidationLabelAttribute(): string
    {
        return match($this->statut_validation) {
            'en_attente' => 'En attente de validation',
            'approuve' => 'Approuvé',
            'rejete' => 'Rejeté',
            'suspendu' => 'Suspendu',
            default => 'Statut inconnu'
        };
    }

    /**
     * Vérifier si le gestionnaire est validé
     */
    public function isValidated(): bool
    {
        return $this->statut_validation === 'approuve';
    }

    /**
     * Vérifier si le gestionnaire peut accéder à son dashboard
     */
    public function canAccessManagerDashboard(): bool
    {
        return $this->role === 'gestionnaire' && $this->isValidated();
    }

    /**
     * Scope pour filtrer par rôle
     */
    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope pour les gestionnaires en attente
     */
    public function scopeGestionnairesEnAttente($query)
    {
        return $query->where('role', 'gestionnaire')
                    ->where('statut_validation', 'en_attente');
    }

    /**
     * Scope pour les gestionnaires validés
     */
    public function scopeGestionnairesValides($query)
    {
        return $query->where('role', 'gestionnaire')
                    ->where('statut_validation', 'approuve');
    }

    /**
     * Vérifier si l'utilisateur a un rôle spécifique
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Vérifier si l'utilisateur a l'un des rôles donnés
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    /**
     * Relations
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }

    /**
     * Terrains gérés (pour les gestionnaires)
     */
    public function terrains()
    {
        return $this->hasMany(TerrainSynthetiquesDakar::class, 'gestionnaire_id');
    }

    /**
     * Contrats de commission
     */
    public function contratsCommission()
    {
        return $this->hasMany(ContratCommission::class, 'gestionnaire_id');
    }

    /**
     * Demandes de terrains soumises
     */
    public function demandesTerrains()
    {
        return $this->hasMany(DemandeTerrain::class, 'gestionnaire_id');
    }

    /**
     * Utilisateurs validés par cet admin
     */
    public function utilisateursValides()
    {
        return $this->hasMany(User::class, 'valide_par');
    }

    /**
     * Validateur (admin qui a validé cet utilisateur)
     */
    public function validateur()
    {
        return $this->belongsTo(User::class, 'valide_par');
    }

    /**
     * Imports effectués
     */
    public function imports()
    {
        return $this->hasMany(ImportTerrain::class, 'importe_par');
    }

    /**
     * Historique des validations effectuées
     */
    public function validationsEffectuees()
    {
        return $this->hasMany(HistoriqueValidation::class, 'validateur_id');
    }

    /**
     * Historique des validations reçues
     */
    public function historiqueValidations()
    {
        return $this->morphMany(HistoriqueValidation::class, 'validable');
    }

    public function contratActif()
    {
        return $this->hasOne(ContratCommission::class, 'gestionnaire_id')
                    ->where('statut', 'actif')
                    ->where('date_debut', '<=', now())
                    ->where(function ($query) {
                        $query->where('date_fin', '>=', now())
                              ->orWhereNull('date_fin');
                    })
                    ->latest('date_debut');
    }
}
