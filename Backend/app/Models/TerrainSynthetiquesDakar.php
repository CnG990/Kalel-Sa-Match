<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class TerrainSynthetiquesDakar extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'terrains_synthetiques_dakar';

    protected $fillable = [
        'nom',
        'description',
        'adresse',
        'latitude',
        'longitude',
        'prix_heure',
        'capacite',
        'surface',
        'gestionnaire_id',
        'contact_telephone',
        'email_contact',
        'horaires_ouverture',
        'horaires_fermeture',
        'type_surface',
        'equipements',
        'regles_maison',
        'note_moyenne',
        'nombre_avis',
        'image_principale',
        'images_supplementaires',
        'est_actif'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'prix_heure' => 'decimal:2',
        'capacite' => 'integer',
        'surface' => 'decimal:2',
        'note_moyenne' => 'decimal:2',
        'nombre_avis' => 'integer',
        'est_actif' => 'boolean',
        'images_supplementaires' => 'array',
        'equipements' => 'array',
        'horaires_ouverture' => 'datetime:H:i',
        'horaires_fermeture' => 'datetime:H:i'
    ];

    // Relations
    // Note: Relation terrains supprimée car tout est maintenant centralisé dans terrains_synthetiques_dakar

    public function gestionnaire()
    {
        return $this->belongsTo(User::class, 'gestionnaire_id');
    }

    public function reservations()
    {
        // Relation directe avec les réservations via terrain_synthetique_id
        return $this->hasMany(Reservation::class, 'terrain_synthetique_id');
    }

    public function reservationsViaTerrains()
    {
        // Ancienne relation via la table terrains (pour compatibilité)
        return $this->hasManyThrough(
            Reservation::class,
            Terrain::class,
            'terrain_synthetique_id', // Foreign key on terrains table
            'terrain_id',             // Foreign key on reservations table
            'id',                     // Local key on terrains_synthetiques_dakar table
            'id'                      // Local key on terrains table
        );
    }

    // Scopes
    public function scopeActif($query)
    {
        return $query->where('est_actif', true);
    }

    public function scopeNearby($query, $latitude, $longitude, $radius = 10)
    {
        return $query->selectRaw("
            *,
            (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
        ", [$latitude, $longitude, $latitude])
        ->having('distance', '<', $radius)
        ->orderBy('distance');
    }

    // Méthodes
    public function getDistanceFromAttribute($latitude, $longitude)
    {
        $earthRadius = 6371; // Rayon de la Terre en kilomètres
        
        $latDelta = deg2rad($this->latitude - $latitude);
        $lonDelta = deg2rad($this->longitude - $longitude);
        
        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($latitude)) * cos(deg2rad($this->latitude)) *
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
        // Retourner une note par défaut pour l'instant
        return 4.5;
    }

    public function isAvailableAt($dateTime)
    {
        return $this->est_actif;
    }

    public function getRevenueTotalMonth()
    {
        return $this->reservations()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->whereIn('statut', ['confirmee', 'terminee'])
            ->sum('montant_total');
    }

    public function getTauxOccupation()
    {
        // Calcul simple du taux d'occupation
        $totalReservations = $this->reservations()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        
        // Estimation: 30 créneaux possibles par mois
        return min(100, ($totalReservations / 30) * 100);
    }
} 