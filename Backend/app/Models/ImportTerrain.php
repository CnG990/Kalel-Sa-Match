<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ImportTerrain extends Model
{
    use HasFactory;

    protected $table = 'imports_terrains';

    protected $fillable = [
        'importe_par',
        'nom_fichier_original',
        'chemin_fichier',
        'type_fichier',
        'source',
        'metadonnees',
        'statut_traitement',
        'resultats_traitement',
        'nb_terrains_importes',
    ];

    protected $casts = [
        'metadonnees' => 'array',
    ];

    /**
     * L'utilisateur qui a effectué l'import
     */
    public function importateur()
    {
        return $this->belongsTo(User::class, 'importe_par');
    }

    /**
     * Les terrains créés à partir de cet import
     */
    public function terrainsCreees()
    {
        return $this->hasMany(TerrainSynthetiquesDakar::class, 'import_id');
    }

    /**
     * Vérifier si l'import est terminé avec succès
     */
    public function isTermine(): bool
    {
        return $this->statut_traitement === 'termine';
    }

    /**
     * Vérifier si l'import est en erreur
     */
    public function hasError(): bool
    {
        return $this->statut_traitement === 'erreur';
    }

    /**
     * Scope pour les imports terminés
     */
    public function scopeTermines($query)
    {
        return $query->where('statut_traitement', 'termine');
    }

    /**
     * Scope pour les imports en erreur
     */
    public function scopeEnErreur($query)
    {
        return $query->where('statut_traitement', 'erreur');
    }

    /**
     * Scope par type de fichier
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type_fichier', $type);
    }

    /**
     * Scope par source
     */
    public function scopeBySource($query, string $source)
    {
        return $query->where('source', $source);
    }

    /**
     * Obtenir l'URL du fichier
     */
    public function getFileUrl(): ?string
    {
        if (!$this->chemin_fichier) {
            return null;
        }

        return Storage::url($this->chemin_fichier);
    }

    /**
     * Obtenir la taille du fichier
     */
    public function getFileSize(): ?int
    {
        if (!$this->chemin_fichier || !Storage::exists($this->chemin_fichier)) {
            return null;
        }

        return Storage::size($this->chemin_fichier);
    }

    /**
     * Obtenir la taille du fichier formatée
     */
    public function getFormattedFileSize(): string
    {
        $size = $this->getFileSize();
        
        if (!$size) {
            return 'Inconnu';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $unitIndex = 0;
        
        while ($size >= 1024 && $unitIndex < count($units) - 1) {
            $size /= 1024;
            $unitIndex++;
        }

        return round($size, 2) . ' ' . $units[$unitIndex];
    }

    /**
     * Supprimer le fichier physique
     */
    public function deleteFile(): bool
    {
        if ($this->chemin_fichier && Storage::exists($this->chemin_fichier)) {
            return Storage::delete($this->chemin_fichier);
        }

        return true;
    }

    /**
     * Marquer l'import comme en cours
     */
    public function marquerEnCours(): void
    {
        $this->update(['statut_traitement' => 'en_cours']);
    }

    /**
     * Marquer l'import comme terminé
     */
    public function marquerTermine(int $nbTerrainsImportes = 0, string $resultats = null): void
    {
        $this->update([
            'statut_traitement' => 'termine',
            'nb_terrains_importes' => $nbTerrainsImportes,
            'resultats_traitement' => $resultats,
        ]);
    }

    /**
     * Marquer l'import comme en erreur
     */
    public function marquerErreur(string $messageErreur): void
    {
        $this->update([
            'statut_traitement' => 'erreur',
            'resultats_traitement' => $messageErreur,
        ]);
    }

    /**
     * Ajouter des métadonnées
     */
    public function ajouterMetadonnees(array $metadonnees): void
    {
        $currentMetadonnees = $this->metadonnees ?? [];
        $this->update([
            'metadonnees' => array_merge($currentMetadonnees, $metadonnees)
        ]);
    }

    /**
     * Accesseur pour le label du statut
     */
    public function getStatutLabelAttribute(): string
    {
        return match($this->statut_traitement) {
            'en_attente' => 'En attente',
            'en_cours' => 'En cours de traitement',
            'termine' => 'Terminé',
            'erreur' => 'Erreur',
            default => 'Statut inconnu'
        };
    }

    /**
     * Accesseur pour le label du type de fichier
     */
    public function getTypeFichierLabelAttribute(): string
    {
        return match($this->type_fichier) {
            'csv' => 'CSV',
            'json' => 'JSON',
            'geojson' => 'GeoJSON',
            'kml' => 'KML',
            'shapefile' => 'Shapefile',
            default => strtoupper($this->type_fichier)
        };
    }

    /**
     * Accesseur pour le label de la source
     */
    public function getSourceLabelAttribute(): string
    {
        return match($this->source) {
            'kobocollect' => 'KoBoCollect',
            'upload_manuel' => 'Upload manuel',
            'api_externe' => 'API externe',
            default => 'Source inconnue'
        };
    }
} 