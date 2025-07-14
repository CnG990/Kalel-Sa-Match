<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Remboursement extends Model
{
    use HasFactory;

    protected $table = 'remboursements';

    protected $fillable = [
        'reservation_id',
        'user_id',
        'montant_acompte',
        'montant_remboursement',
        'montant_perdu',
        'statut',
        'date_demande',
        'heures_avant_match',
        'motif_annulation',
        'regle_appliquee',
        'traite_par',
        'date_traitement',
        'methode_remboursement',
        'reference_transaction',
        'commentaire_admin'
    ];

    protected $casts = [
        'date_demande' => 'datetime',
        'date_traitement' => 'datetime',
        'montant_acompte' => 'integer',
        'montant_remboursement' => 'integer',
        'montant_perdu' => 'integer',
        'heures_avant_match' => 'float'
    ];

    /**
     * Relation avec la réservation
     */
    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    /**
     * Relation avec l'utilisateur (client)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec l'admin/gestionnaire qui traite le remboursement
     */
    public function traitePar()
    {
        return $this->belongsTo(User::class, 'traite_par');
    }

    /**
     * Accessor pour le statut formaté
     */
    public function getStatutFormateAttribute()
    {
        $statuts = [
            'en_attente' => 'En attente de traitement',
            'approuve' => 'Approuvé et remboursé',
            'refuse' => 'Refusé',
            'non_applicable' => 'Non remboursable'
        ];

        return $statuts[$this->statut] ?? $this->statut;
    }

    /**
     * Accessor pour la règle appliquée formatée
     */
    public function getRegleFormateeAttribute()
    {
        $regles = [
            '12h_plus' => 'Annulation 12h+ avant le match',
            '12h_moins' => 'Annulation moins de 12h avant le match'
        ];

        return $regles[$this->regle_appliquee] ?? $this->regle_appliquee;
    }

    /**
     * Accessor pour le montant d'acompte formaté
     */
    public function getMontantAcompteFormateAttribute()
    {
        return number_format($this->montant_acompte, 0, ',', ' ') . ' FCFA';
    }

    /**
     * Accessor pour le montant de remboursement formaté
     */
    public function getMontantRemboursementFormateAttribute()
    {
        return number_format($this->montant_remboursement, 0, ',', ' ') . ' FCFA';
    }

    /**
     * Accessor pour le montant perdu formaté
     */
    public function getMontantPerduFormateAttribute()
    {
        return number_format($this->montant_perdu, 0, ',', ' ') . ' FCFA';
    }

    /**
     * Scope pour les remboursements en attente
     */
    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    /**
     * Scope pour les remboursements approuvés
     */
    public function scopeApprouves($query)
    {
        return $query->where('statut', 'approuve');
    }

    /**
     * Scope pour les remboursements d'un gestionnaire
     */
    public function scopeParGestionnaire($query, $gestionnaireId)
    {
        return $query->whereHas('reservation.terrain', function($q) use ($gestionnaireId) {
            $q->where('gestionnaire_id', $gestionnaireId);
        });
    }

    /**
     * Vérifier si le remboursement peut être traité
     */
    public function peutEtreTrait()
    {
        return $this->statut === 'en_attente' && $this->montant_remboursement > 0;
    }

    /**
     * Marquer comme approuvé
     */
    public function approuver($traitePar, $referenceTransaction, $commentaire = null)
    {
        $this->update([
            'statut' => 'approuve',
            'traite_par' => $traitePar,
            'date_traitement' => now(),
            'reference_transaction' => $referenceTransaction,
            'commentaire_admin' => $commentaire
        ]);

        return $this;
    }

    /**
     * Marquer comme refusé
     */
    public function refuser($traitePar, $commentaire = null)
    {
        $this->update([
            'statut' => 'refuse',
            'traite_par' => $traitePar,
            'date_traitement' => now(),
            'commentaire_admin' => $commentaire
        ]);

        return $this;
    }

    /**
     * Calculer le délai de traitement
     */
    public function getDelaiTraitementAttribute()
    {
        if (!$this->date_traitement || !$this->date_demande) {
            return null;
        }

        $delai = Carbon::parse($this->date_demande)->diffInHours(Carbon::parse($this->date_traitement));
        
        if ($delai < 24) {
            return $delai . ' heures';
        } else {
            return round($delai / 24, 1) . ' jours';
        }
    }

    /**
     * Statistiques globales des remboursements
     */
    public static function getStatistiquesGlobales()
    {
        return [
            'total_demandes' => self::count(),
            'total_montant_acomptes' => self::sum('montant_acompte'),
            'total_montant_rembourse' => self::where('statut', 'approuve')->sum('montant_remboursement'),
            'total_montant_perdu' => self::sum('montant_perdu'),
            'taux_remboursement' => self::count() > 0 
                ? round((self::where('statut', 'approuve')->count() / self::count()) * 100, 2) 
                : 0,
            'delai_moyen_traitement' => self::whereNotNull('date_traitement')
                ->get()
                ->average(function($remboursement) {
                    return Carbon::parse($remboursement->date_demande)
                        ->diffInHours(Carbon::parse($remboursement->date_traitement));
                })
        ];
    }
} 