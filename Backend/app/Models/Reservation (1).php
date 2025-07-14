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
        'user_id',
        'date_debut',
        'date_fin',
        'montant_total',
        'statut',
        'notes'
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'montant_total' => 'decimal:2'
    ];

    // Relations
    public function terrain()
    {
        return $this->belongsTo(TerrainSynthetiquesDakar::class, 'terrain_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paiements()
    {
        return $this->morphMany(Paiement::class, 'payable');
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
}
