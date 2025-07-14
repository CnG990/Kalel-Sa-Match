<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContratCommission extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'contrats_commission';

    protected $fillable = [
        'gestionnaire_id',
        'terrain_synthetique_id',
        'taux_commission',
        'type_contrat',
        'date_debut',
        'date_fin',
        'statut',
        'conditions_speciales',
        'historique_negociation',
    ];

    protected $casts = [
        'taux_commission' => 'decimal:2',
        'date_debut' => 'date',
        'date_fin' => 'date',
        'historique_negociation' => 'array',
    ];

    /**
     * Le gestionnaire associé au contrat
     */
    public function gestionnaire()
    {
        return $this->belongsTo(User::class, 'gestionnaire_id');
    }

    /**
     * Le terrain associé (null si contrat global)
     */
    public function terrainSynthetique()
    {
        return $this->belongsTo(TerrainSynthetiquesDakar::class, 'terrain_synthetique_id');
    }

    /**
     * Vérifier si le contrat est actif
     */
    public function isActif(): bool
    {
        return $this->statut === 'actif' && 
               (!$this->date_fin || $this->date_fin->isFuture());
    }

    /**
     * Scope pour les contrats actifs
     */
    public function scopeActifs($query)
    {
        return $query->where('statut', 'actif')
                    ->where(function($q) {
                        $q->whereNull('date_fin')
                          ->orWhere('date_fin', '>', now());
                    });
    }

    /**
     * Scope pour les contrats globaux
     */
    public function scopeGlobaux($query)
    {
        return $query->where('type_contrat', 'global');
    }

    /**
     * Scope pour les contrats par terrain
     */
    public function scopeParTerrain($query)
    {
        return $query->where('type_contrat', 'par_terrain');
    }

    /**
     * Ajouter une entrée à l'historique de négociation
     */
    public function ajouterNegociation(string $action, float $ancienTaux = null, float $nouveauTaux = null, string $commentaire = null)
    {
        $historique = $this->historique_negociation ?? [];
        
        $nouvelleEntree = [
            'date' => now()->toISOString(),
            'action' => $action,
            'commentaire' => $commentaire,
        ];

        if ($ancienTaux !== null) {
            $nouvelleEntree['ancien_taux'] = $ancienTaux;
        }
        
        if ($nouveauTaux !== null) {
            $nouvelleEntree['nouveau_taux'] = $nouveauTaux;
        }

        $historique[] = $nouvelleEntree;
        
        $this->update(['historique_negociation' => $historique]);
    }

    /**
     * Calculer la commission sur un montant donné
     */
    public function calculerCommission(float $montant): float
    {
        return $montant * ($this->taux_commission / 100);
    }

    /**
     * Accesseur pour le label du statut
     */
    public function getStatutLabelAttribute(): string
    {
        return match($this->statut) {
            'actif' => 'Actif',
            'suspendu' => 'Suspendu',
            'expire' => 'Expiré',
            'annule' => 'Annulé',
            default => 'Statut inconnu'
        };
    }

    /**
     * Accesseur pour le label du type de contrat
     */
    public function getTypeContratLabelAttribute(): string
    {
        return match($this->type_contrat) {
            'global' => 'Contrat global',
            'par_terrain' => 'Par terrain',
            default => 'Type inconnu'
        };
    }
} 