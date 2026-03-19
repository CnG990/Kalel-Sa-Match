<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Paiement extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'paiements';

    protected $fillable = [
        'user_id',
        'payable_id',
        'payable_type',
        'reference_transaction',
        'montant',
        'methode',
        'statut',
        'details_transaction'
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'details_transaction' => 'array'
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payable()
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('statut', $status);
    }

    public function scopeByMethod($query, $method)
    {
        return $query->where('methode', $method);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('statut', 'reussi');
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
    }

    // Accesseurs
    public function getStatutLabelAttribute()
    {
        return match($this->statut) {
            'en_attente' => 'En attente',
            'reussi' => 'Réussi',
            'echoue' => 'Échoué',
            'rembourse' => 'Remboursé',
            default => 'Inconnu'
        };
    }

    public function getMethodeLabelAttribute()
    {
        return match($this->methode) {
            'carte' => 'Carte bancaire',
            'mobile_money' => 'Mobile Money',
            'especes' => 'Espèces',
            default => 'Autre'
        };
    }

    public function getStatutColorAttribute()
    {
        return match($this->statut) {
            'en_attente' => 'warning',
            'reussi' => 'success',
            'echoue' => 'danger',
            'rembourse' => 'info',
            default => 'secondary'
        };
    }

    // Méthodes métier
    public function markAsSuccessful($details = [])
    {
        $this->update([
            'statut' => 'reussi',
            'details_transaction' => array_merge($this->details_transaction ?? [], $details)
        ]);

        return $this;
    }

    public function markAsFailed($reason = null)
    {
        $this->update([
            'statut' => 'echoue',
            'details_transaction' => array_merge($this->details_transaction ?? [], [
                'echec_raison' => $reason,
                'echec_date' => now()
            ])
        ]);

        return $this;
    }

    public function refund($reason = null)
    {
        if ($this->statut !== 'reussi') {
            throw new \Exception('Seuls les paiements réussis peuvent être remboursés');
        }

        $this->update([
            'statut' => 'rembourse',
            'details_transaction' => array_merge($this->details_transaction ?? [], [
                'remboursement_raison' => $reason,
                'remboursement_date' => now()
            ])
        ]);

        return $this;
    }

    public static function generateReference()
    {
        return 'PAY_' . strtoupper(uniqid()) . '_' . time();
    }

    public function processMobileMoney($phoneNumber, $provider = 'orange')
    {
        // Logique d'intégration avec Orange Money, Wave, etc.
        // À implémenter selon les APIs des fournisseurs

        $this->update([
            'details_transaction' => array_merge($this->details_transaction ?? [], [
                'telephone' => $phoneNumber,
                'fournisseur' => $provider,
                'traitement_date' => now()
            ])
        ]);

        // Simulation du traitement
        if (rand(1, 10) > 2) { // 80% de succès
            return $this->markAsSuccessful([
                'transaction_id' => 'MM_' . uniqid(),
                'provider_reference' => strtoupper(uniqid())
            ]);
        } else {
            return $this->markAsFailed('Échec de la transaction mobile money');
        }
    }

    public function processCard($cardData)
    {
        // Logique d'intégration avec les processeurs de cartes
        // À implémenter selon les APIs (Stripe, PayPal, etc.)

        $this->update([
            'details_transaction' => array_merge($this->details_transaction ?? [], [
                'carte_type' => $cardData['type'] ?? 'visa',
                'carte_derniers_chiffres' => substr($cardData['number'] ?? '', -4),
                'traitement_date' => now()
            ])
        ]);

        // Simulation du traitement
        if (rand(1, 10) > 1) { // 90% de succès
            return $this->markAsSuccessful([
                'transaction_id' => 'CARD_' . uniqid(),
                'authorization_code' => strtoupper(uniqid())
            ]);
        } else {
            return $this->markAsFailed('Carte refusée');
        }
    }

    public function sendReceipt()
    {
        if ($this->statut !== 'reussi') {
            return false;
        }

        // Envoyer reçu par email
        // À implémenter avec le système de mails

        return true;
    }
}
