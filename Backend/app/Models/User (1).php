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
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'mot_de_passe',
        'telephone',
        'role',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'mot_de_passe',
        'remember_token',
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
            'mot_de_passe' => 'hashed',
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
        return $this->prenom . ' ' . $this->nom;
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
     * Scope pour filtrer par rôle
     */
    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
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
}
