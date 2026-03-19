<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Terrain extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'terrains';

    protected $fillable = [
        'terrain_synthetique_id',
        'nom',
        'description',
        'capacite',
        'prix_heure',
        'est_disponible'
    ];

    protected $casts = [
        'prix_heure' => 'decimal:2',
        'est_disponible' => 'boolean',
        'capacite' => 'integer'
    ];

    // Relations
    public function terrainSynthetique()
    {
        return $this->belongsTo(TerrainSynthetiquesDakar::class, 'terrain_synthetique_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    // Scopes
    public function scopeDisponible($query)
    {
        return $query->where('est_disponible', true);
    }

    public function scopeByPriceRange($query, $min, $max)
    {
        return $query->whereBetween('prix_heure', [$min, $max]);
    }

    // Accesseurs
    public function getNomCompletAttribute()
    {
        return $this->terrainSynthetique->name . ' - ' . $this->nom;
    }

    public function getAdresseAttribute()
    {
        return $this->terrainSynthetique?->adresse ?? 'Adresse non disponible';
    }

    public function getCoordinatesAttribute()
    {
        return [
            'latitude' => $this->terrainSynthetique?->latitude ?? 0,
            'longitude' => $this->terrainSynthetique?->longitude ?? 0
        ];
    }

    // Méthodes métier
    public function isAvailableAt($dateDebut, $dateFin)
    {
        if (!$this->est_disponible) {
            return false;
        }

        // Vérifier les conflits avec les réservations existantes
        return !$this->reservations()
            ->whereIn('statut', ['en_attente', 'confirmee'])
            ->where(function ($query) use ($dateDebut, $dateFin) {
                $query->whereBetween('date_debut', [$dateDebut, $dateFin])
                      ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
                      ->orWhere(function ($q) use ($dateDebut, $dateFin) {
                          $q->where('date_debut', '<=', $dateDebut)
                            ->where('date_fin', '>=', $dateFin);
                      });
            })
            ->exists();
    }

    public function getReservationsForDate($date)
    {
        return $this->reservations()
            ->whereDate('date_debut', $date)
            ->whereIn('statut', ['en_attente', 'confirmee'])
            ->orderBy('date_debut')
            ->get();
    }

    public function getTauxOccupation($periode = 'month')
    {
        $debut = match($periode) {
            'day' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth()
        };

        $fin = match($periode) {
            'day' => now()->endOfDay(),
            'week' => now()->endOfWeek(),
            'month' => now()->endOfMonth(),
            'year' => now()->endOfYear(),
            default => now()->endOfMonth()
        };

        $totalHeures = $debut->diffInHours($fin);
        $heuresReservees = $this->reservations()
            ->whereBetween('date_debut', [$debut, $fin])
            ->whereIn('statut', ['confirmee', 'terminee'])
            ->sum(\DB::raw('EXTRACT(EPOCH FROM (date_fin - date_debut))/3600'));

        return $totalHeures > 0 ? ($heuresReservees / $totalHeures) * 100 : 0;
    }

    public function getRevenue($periode = 'month')
    {
        $debut = match($periode) {
            'day' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth()
        };

        $fin = match($periode) {
            'day' => now()->endOfDay(),
            'week' => now()->endOfWeek(),
            'month' => now()->endOfMonth(),
            'year' => now()->endOfYear(),
            default => now()->endOfMonth()
        };

        return $this->reservations()
            ->whereBetween('date_debut', [$debut, $fin])
            ->whereIn('statut', ['confirmee', 'terminee'])
            ->sum('montant_total');
    }

    public function getCreneauxDisponibles($date, $dureeHeures = 1)
    {
        $reservations = $this->getReservationsForDate($date);
        $creneaux = [];
        
        // Horaires d'ouverture du terrain parent
        $ouverture = $this->terrainSynthetique->horaires_ouverture;
        $fermeture = $this->terrainSynthetique->horaires_fermeture;
        
        $debut = \Carbon\Carbon::parse($date . ' ' . $ouverture);
        $fin = \Carbon\Carbon::parse($date . ' ' . $fermeture);
        
        while ($debut->copy()->addHours($dureeHeures)->lte($fin)) {
            $creneauFin = $debut->copy()->addHours($dureeHeures);
            
            $conflit = $reservations->first(function ($reservation) use ($debut, $creneauFin) {
                return $reservation->date_debut < $creneauFin && $reservation->date_fin > $debut;
            });
            
            if (!$conflit) {
                $creneaux[] = [
                    'debut' => $debut->format('H:i'),
                    'fin' => $creneauFin->format('H:i'),
                    'prix' => $this->prix_heure * $dureeHeures
                ];
            }
            
            $debut->addMinutes(30); // Créneaux de 30 minutes
        }
        
        return $creneaux;
    }
}
