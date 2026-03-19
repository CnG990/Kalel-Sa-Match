<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reservation extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'reservations';

    protected $fillable = [
        'terrain_id',
        'terrain_synthetique_id',
        'user_id',
        'date_debut',
        'date_fin',
        'montant_total',
        'statut',
        'notes',
        'qr_code_path',
        'qr_code_token',
        'code_ticket',
        'derniere_validation',
        'date_annulation',
        'motif_annulation',
        'annule_par',
        'heures_avant_annulation',
        'acompte_verse'
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'derniere_validation' => 'datetime',
        'date_annulation' => 'datetime',
        'montant_total' => 'decimal:2',
        'heures_avant_annulation' => 'float',
        'acompte_verse' => 'boolean'
    ];

    /**
     * Boot method - génère automatiquement un code de ticket
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($reservation) {
            if (empty($reservation->code_ticket)) {
                $reservation->code_ticket = static::generateTicketCode();
            }
        });
    }

    // Relations
    public function terrain()
    {
        return $this->belongsTo(Terrain::class, 'terrain_id', 'id');
    }

    public function terrainSynthetique()
    {
        return $this->belongsTo(TerrainSynthetiquesDakar::class, 'terrain_synthetique_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paiements()
    {
        return $this->morphMany(Paiement::class, 'payable');
    }

    public function remboursements()
    {
        return $this->hasMany(Remboursement::class);
    }

    public function annulePar()
    {
        return $this->belongsTo(User::class, 'annule_par');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('statut', $status);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('date_debut', '>', now());
    }

    public function scopePast($query)
    {
        return $query->where('date_fin', '<', now());
    }

    public function scopeToday($query)
    {
        return $query->whereDate('date_debut', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('date_debut', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('date_debut', now()->month)
                    ->whereYear('date_debut', now()->year);
    }

    // Accesseurs
    public function getDureeHeuresAttribute()
    {
        return $this->date_debut->diffInHours($this->date_fin);
    }

    public function getStatutLabelAttribute()
    {
        return match($this->statut) {
            'en_attente' => 'En attente',
            'confirmee' => 'Confirmée',
            'annulee' => 'Annulée',
            'terminee' => 'Terminée',
            default => 'Inconnu'
        };
    }

    public function getStatutColorAttribute()
    {
        return match($this->statut) {
            'en_attente' => 'warning',
            'confirmee' => 'success',
            'annulee' => 'danger',
            'terminee' => 'info',
            default => 'secondary'
        };
    }

    public function getEstAnnulableAttribute()
    {
        return in_array($this->statut, ['en_attente', 'confirmee']) 
               && $this->date_debut > now()->addHour();
    }

    public function getEstModifiableAttribute()
    {
        return $this->statut === 'en_attente' 
               && $this->date_debut > now()->addHours(2);
    }

    // Méthodes métier
    public function confirm()
    {
        if ($this->statut !== 'en_attente') {
            throw new \Exception('Seules les réservations en attente peuvent être confirmées');
        }

        $this->update(['statut' => 'confirmee']);
        return $this;
    }

    public function cancel($reason = null)
    {
        if (!$this->est_annulable) {
            throw new \Exception('Cette réservation ne peut plus être annulée');
        }

        $this->update([
            'statut' => 'annulee',
            'notes' => $this->notes . "\nAnnulée: " . ($reason ?? 'Aucune raison spécifiée')
        ]);

        return $this;
    }

    public function complete()
    {
        if ($this->statut !== 'confirmee') {
            throw new \Exception('Seules les réservations confirmées peuvent être terminées');
        }

        if ($this->date_fin > now()) {
            throw new \Exception('La réservation n\'est pas encore terminée');
        }

        $this->update(['statut' => 'terminee']);
        return $this;
    }

    public function checkAvailability()
    {
        // Vérifier s'il y a des conflits avec d'autres réservations
        $conflicts = static::where('terrain_id', $this->terrain_id)
            ->where('id', '!=', $this->id ?? 0)
            ->whereIn('statut', ['en_attente', 'confirmee'])
            ->where(function ($query) {
                $query->whereBetween('date_debut', [$this->date_debut, $this->date_fin])
                      ->orWhereBetween('date_fin', [$this->date_debut, $this->date_fin])
                      ->orWhere(function ($q) {
                          $q->where('date_debut', '<=', $this->date_debut)
                            ->where('date_fin', '>=', $this->date_fin);
                      });
            })
            ->exists();

        return !$conflicts;
    }

    public function calculateTotal()
    {
        $heures = $this->duree_heures;
        $prixHeure = $this->terrain->terrainSynthetique->prix_heure ?? 0;
        
        return $heures * $prixHeure;
    }

    public function sendConfirmationNotification()
    {
        // Envoyer notification de confirmation
        // À implémenter avec le système de notifications
    }

    public function sendReminderNotification()
    {
        // Envoyer rappel 1h avant
        // À implémenter avec le système de notifications
    }

    /**
     * Générer un code de ticket unique automatiquement
     * Format: TSK-KSM-ANNÉE-XXXXXX
     */
    public static function generateTicketCode()
    {
        do {
            // Format: TSK-KSM-ANNÉE-RANDOM6DIGITS
            $year = now()->year;
            $randomNumber = str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
            $code = 'TSK-KSM-' . $year . '-' . $randomNumber;
            
            // Vérifier l'unicité
            $exists = static::where('code_ticket', $code)->exists();
        } while ($exists);

        return $code;
    }

    /**
     * Extraire le code final depuis un code complet ou partiel
     */
    public static function parseTicketCode($input)
    {
        $input = strtoupper(trim($input));
        
        // Si c'est déjà un code complet TSK-KSM-YYYY-XXXXXX
        if (preg_match('/^TSK-KSM-\d{4}-(\d{6})$/', $input, $matches)) {
            return $input;
        }
        
        // Si c'est juste le code final (6 chiffres)
        if (preg_match('/^\d{6}$/', $input)) {
            $year = now()->year;
            return 'TSK-KSM-' . $year . '-' . $input;
        }
        
        // Si c'est avec préfixe partiel
        if (preg_match('/^KSM-\d{4}-(\d{6})$/', $input)) {
            return 'TSK-' . $input;
        }
        
        return $input; // Retourner tel quel si format non reconnu
    }

    /**
     * Marquer comme validé par un gestionnaire
     */
    public function markAsValidated()
    {
        $this->update(['derniere_validation' => now()]);
        return $this;
    }

    /**
     * Vérifier si le ticket a été validé récemment (dans les 2 dernières heures)
     */
    public function wasRecentlyValidated()
    {
        return $this->derniere_validation && 
               $this->derniere_validation->gt(now()->subHours(2));
    }

    /**
     * Calculer le montant de remboursement selon les règles (12h avant = remboursement complet)
     */
    public function calculateRefundAmount()
    {
        if ($this->statut === 'annulee' || !$this->acompte_verse) {
            return 0;
        }

        $dateMatch = $this->date_debut;
        $maintenant = now();
        $heuresRestantes = $maintenant->diffInHours($dateMatch, false);

        $acompte = 5000; // FCFA
        
        // Règle: 12h+ avant = remboursement complet, moins de 12h = perte de l'acompte
        return $heuresRestantes >= 12 ? $acompte : 0;
    }

    /**
     * Vérifier si la réservation peut être remboursée
     */
    public function isRefundable()
    {
        return $this->statut !== 'annulee' 
               && $this->statut !== 'terminee'
               && $this->acompte_verse
               && $this->date_debut > now();
    }

    /**
     * Annuler avec gestion du remboursement
     */
    public function cancelWithRefund($motif, $annulePar)
    {
        if (!$this->isRefundable()) {
            throw new \Exception('Cette réservation ne peut pas être annulée');
        }

        $heuresRestantes = now()->diffInHours($this->date_debut, false);
        $montantRemboursement = $this->calculateRefundAmount();

        // Mettre à jour la réservation
        $this->update([
            'statut' => 'annulee',
            'date_annulation' => now(),
            'motif_annulation' => $motif,
            'annule_par' => $annulePar,
            'heures_avant_annulation' => round($heuresRestantes, 1)
        ]);

        // Créer l'enregistrement de remboursement
        $remboursement = $this->remboursements()->create([
            'user_id' => $this->user_id,
            'montant_acompte' => 5000,
            'montant_remboursement' => $montantRemboursement,
            'montant_perdu' => 5000 - $montantRemboursement,
            'statut' => $montantRemboursement > 0 ? 'en_attente' : 'non_applicable',
            'date_demande' => now(),
            'heures_avant_match' => round($heuresRestantes, 1),
            'motif_annulation' => $motif,
            'regle_appliquee' => $heuresRestantes >= 12 ? '12h_plus' : '12h_moins',
            'methode_remboursement' => $montantRemboursement > 0 ? 'orange_money' : null
        ]);

        return [
            'reservation' => $this,
            'remboursement' => $remboursement,
            'montant_remboursement' => $montantRemboursement
        ];
    }

    /**
     * Obtenir le dernier remboursement
     */
    public function getLatestRefund()
    {
        return $this->remboursements()->latest()->first();
    }

    /**
     * Vérifier si un remboursement est en cours
     */
    public function hasRefundInProgress()
    {
        return $this->remboursements()->where('statut', 'en_attente')->exists();
    }
}
