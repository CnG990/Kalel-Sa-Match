<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TerrainSynthetiquesDakar extends Model
{
    protected $table = 'terrains_synthetiques_dakar';
    
    protected $fillable = [
        'name',
        'description', 
        'adresse',
        'latitude',
        'longitude',
        'prix_heure',
        'area',
        'capacite_spectateurs',
        'equipements',
        'gestionnaire',
        'contact_telephone',
        'contact_email',
        'horaires_ouverture',
        'etat'
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'prix_heure' => 'decimal:2',
        'area' => 'float',
        'equipements' => 'array',
        'horaires_ouverture' => 'array'
    ];

    /**
     * Scope pour les terrains actifs
     */
    public function scopeActif($query)
    {
        return $query->whereIn('etat', [
            'Bon état',
            'Très bon état', 
            'Excellent état',
            'État correct'
        ]);
    }

    /**
     * Scope pour les terrains disponibles
     */
    public function scopeDisponible($query)
    {
        return $query->where('etat', '!=', 'maintenance');
    }

    /**
     * Scope pour recherche géographique
     */
    public function scopeNearby($query, $latitude, $longitude, $radius = 10)
    {
        return $query->select('*')
            ->selectRaw("
                (
                    6371 * acos(
                        cos(radians(?)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians(?)) + 
                        sin(radians(?)) * sin(radians(latitude))
                    )
                ) AS distance
            ", [$latitude, $longitude, $latitude])
            ->whereRaw("
                (
                    6371 * acos(
                        cos(radians(?)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians(?)) + 
                        sin(radians(?)) * sin(radians(latitude))
                    )
                ) < ?
            ", [$latitude, $longitude, $latitude, $radius])
            ->orderBy('distance');
    }

    /**
     * Relations
     */
    public function terrains()
    {
        return $this->hasMany(Terrain::class, 'terrain_synthetique_id');
    }

    public function reservations()
    {
        return $this->hasManyThrough(Reservation::class, Terrain::class, 'terrain_synthetique_id', 'terrain_id');
    }

    /**
     * Attributs calculés
     */
    public function getDistanceFromAttribute($latitude, $longitude)
    {
        $earthRadius = 6371; // km
        
        $latDelta = deg2rad($latitude - $this->latitude);
        $lonDelta = deg2rad($longitude - $this->longitude);
        
        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($this->latitude)) * cos(deg2rad($latitude)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);
             
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return round($earthRadius * $c, 2);
    }

    public function getTotalReservations()
    {
        return $this->reservations()->count();
    }

    public function getAverageRating()
    {
        // Pour l'instant retourner une valeur par défaut
        return 4.2;
    }

    public function getEstOuvertAttribute()
    {
        // Logique simple d'ouverture
        $now = now();
        $hour = $now->hour;
        
        // Ouvert de 6h à 23h par défaut
        return $hour >= 6 && $hour <= 23;
    }
}
