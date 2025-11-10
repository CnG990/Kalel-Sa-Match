<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'est_actif',
        'jours_disponibles',
        'creneaux_disponibles',
        'conditions_abonnement',
        'accepte_paiement_differe',
        'acompte_minimum',
        'duree_engagement_minimum',
        'reductions_abonnement'
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
        'horaires_fermeture' => 'datetime:H:i',
        'jours_disponibles' => 'array',
        'creneaux_disponibles' => 'array',
        'conditions_abonnement' => 'array',
        'accepte_paiement_differe' => 'boolean',
        'acompte_minimum' => 'decimal:2',
        'duree_engagement_minimum' => 'integer',
        'reductions_abonnement' => 'array'
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

    public function prixVariables(): HasMany
    {
        return $this->hasMany(PrixTerrain::class, 'terrain_id');
    }

    public function avis(): HasMany
    {
        return $this->hasMany(AvisTerrain::class, 'terrain_id');
    }

    // Méthode pour obtenir le prix selon les critères
    public function getPrixVariable($taille = null, $periode = null, $jour = null, $heure = null)
    {
        return PrixTerrain::getPrix($this->id, $taille, $periode, $jour, $heure);
    }

    // Méthode pour obtenir tous les prix variables
    public function getAllPrixVariables()
    {
        return $this->prixVariables()->where('est_actif', true)->get();
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
        $avisApprouves = $this->avis()->approuves()->get();
        
        if ($avisApprouves->isEmpty()) {
            return 0.0;
        }

        $moyenne = $avisApprouves->avg('note');
        
        // Mettre à jour les champs note_moyenne et nombre_avis
        $this->update([
            'note_moyenne' => round($moyenne, 2),
            'nombre_avis' => $avisApprouves->count()
        ]);

        return round($moyenne, 2);
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

    // Méthodes pour les conditions d'abonnement
    public function getJoursDisponibles()
    {
        return $this->jours_disponibles ?? [
            'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'
        ];
    }

    public function getCreneauxDisponibles()
    {
        return $this->creneaux_disponibles ?? [
            '08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'
        ];
    }

    public function getConditionsAbonnement()
    {
        return $this->conditions_abonnement ?? [
            'engagement_minimum' => $this->duree_engagement_minimum ?? 30,
            'acompte_requis' => $this->acompte_minimum ?? 0,
            'paiement_differe' => $this->accepte_paiement_differe ?? true,
            'annulation' => '24h à l\'avance',
            'report' => 'Autorisé sous conditions'
        ];
    }

    public function getReductionsAbonnement()
    {
        return $this->reductions_abonnement ?? [
            'trimestriel' => 10, // 10% de réduction
            'annuel' => 20,      // 20% de réduction
            'semestriel' => 15   // 15% de réduction
        ];
    }

    public function calculerPrixAbonnement($type, $nbSeances, $dureeSeance)
    {
        $prixBase = $this->prix_heure * $nbSeances * $dureeSeance;
        
        // Appliquer les réductions selon le type
        $reductions = $this->getReductionsAbonnement();
        $reduction = $reductions[$type] ?? 0;
        
        return $prixBase * (1 - $reduction / 100);
    }

    public function getHistoriqueReservations($userId = null)
    {
        $query = $this->reservations()
            ->with(['user'])
            ->orderBy('date_debut', 'desc')
            ->limit(10);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query->get();
    }

    public function getDisponibiliteCreneaux($date, $creneau)
    {
        // Vérifier si le créneau est disponible pour une date donnée
        $reservations = $this->reservations()
            ->whereDate('date_debut', $date)
            ->whereIn('statut', ['en_attente', 'confirmee'])
            ->get();

        // Logique de vérification de disponibilité
        return $reservations->count() < 2; // Exemple: max 2 réservations par créneau
    }
} 