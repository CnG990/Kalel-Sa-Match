<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DemandeTerrain extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'demandes_terrains';

    protected $fillable = [
        'gestionnaire_id',
        'nom_terrain',
        'description',
        'adresse',
        'latitude',
        'longitude',
        'coordonnees_polygon',
        'images_proposees',
        'documents_justificatifs',
        'statut',
        'commentaires_admin',
        'traite_par',
        'date_traitement',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'coordonnees_polygon' => 'array',
        'images_proposees' => 'array',
        'documents_justificatifs' => 'array',
        'date_traitement' => 'datetime',
    ];

    /**
     * Le gestionnaire qui a soumis la demande
     */
    public function gestionnaire()
    {
        return $this->belongsTo(User::class, 'gestionnaire_id');
    }

    /**
     * L'admin qui a traité la demande
     */
    public function traiteur()
    {
        return $this->belongsTo(User::class, 'traite_par');
    }

    /**
     * Le terrain créé suite à l'approbation (si applicable)
     */
    public function terrainCree()
    {
        return $this->hasOne(TerrainSynthetiquesDakar::class)
                    ->where('nom', $this->nom_terrain)
                    ->where('gestionnaire_id', $this->gestionnaire_id);
    }

    /**
     * Vérifier si la demande est en attente
     */
    public function isEnAttente(): bool
    {
        return $this->statut === 'en_attente';
    }

    /**
     * Vérifier si la demande est approuvée
     */
    public function isApprouve(): bool
    {
        return $this->statut === 'approuve';
    }

    /**
     * Vérifier si la demande est rejetée
     */
    public function isRejete(): bool
    {
        return $this->statut === 'rejete';
    }

    /**
     * Scope pour les demandes en attente
     */
    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    /**
     * Scope pour les demandes approuvées
     */
    public function scopeApprouvees($query)
    {
        return $query->where('statut', 'approuve');
    }

    /**
     * Scope pour les demandes rejetées
     */
    public function scopeRejetees($query)
    {
        return $query->where('statut', 'rejete');
    }

    /**
     * Scope par gestionnaire
     */
    public function scopeByGestionnaire($query, int $gestionnaireId)
    {
        return $query->where('gestionnaire_id', $gestionnaireId);
    }

    /**
     * Approuver la demande
     */
    public function approuver(int $traiteurId, string $commentaires = null): void
    {
        $this->update([
            'statut' => 'approuve',
            'traite_par' => $traiteurId,
            'date_traitement' => now(),
            'commentaires_admin' => $commentaires,
        ]);
    }

    /**
     * Rejeter la demande
     */
    public function rejeter(int $traiteurId, string $raison): void
    {
        $this->update([
            'statut' => 'rejete',
            'traite_par' => $traiteurId,
            'date_traitement' => now(),
            'commentaires_admin' => $raison,
        ]);
    }

    /**
     * Mettre en révision
     */
    public function mettreEnRevision(int $traiteurId, string $commentaires): void
    {
        $this->update([
            'statut' => 'en_revision',
            'traite_par' => $traiteurId,
            'date_traitement' => now(),
            'commentaires_admin' => $commentaires,
        ]);
    }

    /**
     * Créer le terrain à partir de la demande approuvée
     */
    public function creerTerrain(): TerrainSynthetiquesDakar
    {
        if (!$this->isApprouve()) {
            throw new \Exception('La demande doit être approuvée pour créer le terrain');
        }

        $terrain = TerrainSynthetiquesDakar::create([
            'gestionnaire_id' => $this->gestionnaire_id,
            'nom' => $this->nom_terrain,
            'description' => $this->description,
            'adresse' => $this->adresse,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'coordonnees_polygon' => $this->coordonnees_polygon,
            'image_principale' => $this->images_proposees[0] ?? null,
            'images_supplementaires' => array_slice($this->images_proposees ?? [], 1),
            'source_creation' => 'demande_gestionnaire',
            'statut_validation' => 'approuve',
            'valide_par' => $this->traite_par,
            'date_validation' => now(),
            'est_actif' => true,
        ]);

        return $terrain;
    }

    /**
     * Obtenir la liste des images avec leurs URLs
     */
    public function getImagesWithUrls(): array
    {
        if (!$this->images_proposees) {
            return [];
        }

        return array_map(function($imagePath) {
            return [
                'path' => $imagePath,
                'url' => asset('storage/' . $imagePath),
            ];
        }, $this->images_proposees);
    }

    /**
     * Obtenir la liste des documents avec leurs URLs
     */
    public function getDocumentsWithUrls(): array
    {
        if (!$this->documents_justificatifs) {
            return [];
        }

        return array_map(function($document) {
            return [
                'nom' => $document['nom'] ?? 'Document',
                'path' => $document['path'],
                'url' => asset('storage/' . $document['path']),
                'type' => $document['type'] ?? 'application/octet-stream',
            ];
        }, $this->documents_justificatifs);
    }

    /**
     * Accesseur pour le label du statut
     */
    public function getStatutLabelAttribute(): string
    {
        return match($this->statut) {
            'en_attente' => 'En attente',
            'approuve' => 'Approuvé',
            'rejete' => 'Rejeté',
            'en_revision' => 'En révision',
            default => 'Statut inconnu'
        };
    }

    /**
     * Accesseur pour la couleur du statut
     */
    public function getStatutColorAttribute(): string
    {
        return match($this->statut) {
            'en_attente' => 'yellow',
            'approuve' => 'green',
            'rejete' => 'red',
            'en_revision' => 'blue',
            default => 'gray'
        };
    }
} 