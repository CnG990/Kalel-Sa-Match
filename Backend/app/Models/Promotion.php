<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promotion extends Model
{
    protected $table = 'promotions';

    protected $fillable = [
        'gestionnaire_id',
        'nom',
        'description', 
        'type_reduction',
        'valeur_reduction',
        'date_debut',
        'date_fin',
        'code_promo',
        'limite_utilisations',
        'utilisations_actuelles',
        'est_active',
        'cible_abonnes',
        'terrain_ids',
        'conditions'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'est_active' => 'boolean',
        'cible_abonnes' => 'boolean',
        'valeur_reduction' => 'decimal:2',
        'terrain_ids' => 'array',
        'conditions' => 'array',
        'utilisations_actuelles' => 'integer',
        'limite_utilisations' => 'integer'
    ];

    public function gestionnaire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'gestionnaire_id');
    }

    public function scopeActive($query)
    {
        return $query->where('est_active', true)
                    ->where('date_debut', '<=', now())
                    ->where('date_fin', '>=', now());
    }

    public function scopeForManager($query, $managerId)
    {
        return $query->where('gestionnaire_id', $managerId);
    }

    public function peutEtreUtilisee(): bool
    {
        if (!$this->est_active) {
            return false;
        }

        if ($this->date_debut > now() || $this->date_fin < now()) {
            return false;
        }

        if ($this->limite_utilisations && $this->utilisations_actuelles >= $this->limite_utilisations) {
            return false;
        }

        return true;
    }

    public function incrementerUtilisation(): void
    {
        $this->increment('utilisations_actuelles');
    }

    public function calculerReduction(float $montant): float
    {
        if ($this->type_reduction === 'pourcentage') {
            return $montant * ($this->valeur_reduction / 100);
        } else {
            return min($this->valeur_reduction, $montant);
        }
    }
} 