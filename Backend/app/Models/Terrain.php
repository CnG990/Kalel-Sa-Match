<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Terrain extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'terrains_synthetiques_dakar';

    protected $fillable = [
        'terrain_synthetique_id',
        'gestionnaire_id',
        'nom',
        'description',
        'capacite',
        'prix_heure',
        'est_disponible',
        'images',
        'equipements',
        'adresse',
        'commune',
        'latitude',
        'longitude',
        'surface',
        'type_pelouse',
        'horaires_ouverture',
        'horaires_fermeture',
        'jours_ouverture',
        'contact_telephone',
        'contact_email',
        'regles_terrain',
        'note_moyenne',
        'nombre_avis',
        'statut_validation',
        'coordonnees_polygon',
        'source_creation'
    ];

    protected $casts = [
        'prix_heure' => 'decimal:2',
        'est_disponible' => 'boolean',
        'capacite' => 'integer',
        'images' => 'array',
        'equipements' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'surface' => 'decimal:2',
        'note_moyenne' => 'decimal:2',
        'nombre_avis' => 'integer',
        'jours_ouverture' => 'array',
        'coordonnees_polygon' => 'array'
    ];

    // Relations
    public function terrainSynthetique()
    {
        return $this->belongsTo(TerrainSynthetiquesDakar::class, 'terrain_synthetique_id');
    }

    /**
     * Relation avec le gestionnaire (temporaire)
     */
    public function gestionnaire()
    {
        // Relation temporaire - en production, utilisez gestionnaire_id
        // return $this->belongsTo(User::class, 'gestionnaire_id');
        
        // Retourner un gestionnaire par défaut pour la démo
        return $this->belongsTo(User::class, 'id', 'id')->where('role', 'gestionnaire')->first();
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function avis()
    {
        return $this->hasMany(AvisTerrain::class);
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

    // Méthodes de gestion des images
    public function addImage($imagePath)
    {
        $images = $this->images ?? [];
        $images[] = $imagePath;
        $this->images = $images;
        $this->save();
    }

    public function removeImage($imagePath)
    {
        $images = $this->images ?? [];
        $images = array_filter($images, function($image) use ($imagePath) {
            return $image !== $imagePath;
        });
        $this->images = array_values($images);
        $this->save();
    }

    public function getImageUrlsAttribute()
    {
        if (!$this->images) return [];
        
        return array_map(function($image) {
            return asset('storage/' . $image);
        }, $this->images);
    }

    public function getPrimaryImageAttribute()
    {
        return $this->images && count($this->images) > 0 
            ? asset('storage/' . $this->images[0])
            : asset('images/terrain-placeholder.jpg');
    }

    // Méthodes de validation et statut
    public function scopeValide($query)
    {
        return $query->where('statut_validation', 'approuve');
    }

    public function scopeEnAttente($query)
    {
        return $query->where('statut_validation', 'en_attente');
    }

    /**
     * Scope pour filtrer par gestionnaire
     */
    public function scopeByGestionnaire($query, $gestionnaireId)
    {
        // Utiliser une condition temporaire qui retourne tous les terrains pour la démo
        // En production, uncomment la ligne suivante et créez la colonne gestionnaire_id
        // return $query->where('gestionnaire_id', $gestionnaireId);
        
        // Pour la démo, retourner les premiers terrains
        return $query->limit(3);
    }

    public function scopeByCommune($query, $commune)
    {
        return $query->where('commune', $commune);
    }

    public function scopeWithEquipement($query, $equipement)
    {
        return $query->whereJsonContains('equipements', $equipement);
    }

    // Méthodes de calcul et statistiques
    public function updateNoteEtAvis()
    {
        $avis = $this->avis()->where('statut', 'approuve');
        $this->note_moyenne = $avis->avg('note') ?? 0;
        $this->nombre_avis = $avis->count();
        $this->save();
    }

    public function getStatistiquesReservations($mois = null)
    {
        $query = $this->reservations()->whereIn('statut', ['confirmee', 'terminee']);
        
        if ($mois) {
            $query->whereMonth('date_debut', $mois)
                  ->whereYear('date_debut', now()->year);
        }

        return [
            'total_reservations' => $query->count(),
            'revenus' => $query->sum('montant_total'),
            'heures_reservees' => $query->sum(\DB::raw('EXTRACT(EPOCH FROM (date_fin - date_debut))/3600')),
            'taux_occupation' => $this->getTauxOccupation($mois ? 'month' : 'year')
        ];
    }

    // Méthodes d'édition
    public function updatePrix($nouveauPrix)
    {
        $this->prix_heure = $nouveauPrix;
        $this->save();
        
        // Log de l'historique des prix
        \Log::info("Prix terrain modifié", [
            'terrain_id' => $this->id,
            'ancien_prix' => $this->getOriginal('prix_heure'),
            'nouveau_prix' => $nouveauPrix,
            'gestionnaire_id' => $this->gestionnaire_id
        ]);
    }

    public function updateHoraires($ouverture, $fermeture, $jours = null)
    {
        $this->horaires_ouverture = $ouverture;
        $this->horaires_fermeture = $fermeture;
        if ($jours) {
            $this->jours_ouverture = $jours;
        }
        $this->save();
    }

    public function toggleDisponibilite()
    {
        $this->est_disponible = !$this->est_disponible;
        $this->save();
        return $this->est_disponible;
    }
}
