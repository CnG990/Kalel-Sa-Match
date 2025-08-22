<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrixTerrain extends Model
{
    protected $table = 'prix_terrains';
    
    protected $fillable = [
        'terrain_id',
        'taille',
        'nom_terrain_specifique',
        'periode',
        'jour_semaine',
        'prix',
        'duree',
        'heure_debut',
        'heure_fin',
        'est_actif'
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'est_actif' => 'boolean',
        'heure_debut' => 'datetime:H:i',
        'heure_fin' => 'datetime:H:i'
    ];

    public function terrain(): BelongsTo
    {
        return $this->belongsTo(TerrainSynthetiquesDakar::class, 'terrain_id');
    }

    // Méthode pour obtenir le prix selon les critères
    public static function getPrix($terrainId, $taille = null, $periode = null, $jour = null, $heure = null)
    {
        $query = self::where('terrain_id', $terrainId)
            ->where('est_actif', true);

        if ($taille) {
            $query->where('taille', $taille);
        }

        if ($periode) {
            $query->where('periode', $periode);
        }

        if ($jour) {
            $query->where('jour_semaine', $jour);
        }

        if ($heure) {
            $query->where('heure_debut', '<=', $heure)
                  ->where('heure_fin', '>=', $heure);
        }

        return $query->first();
    }
}





