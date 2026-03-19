<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvisTerrain extends Model
{
    use HasFactory;

    protected $table = 'avis_terrains';

    protected $fillable = [
        'user_id',
        'terrain_id',
        'reservation_id',
        'note',
        'commentaire',
        'est_approuve'
    ];

    protected $casts = [
        'note' => 'integer',
        'est_approuve' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec le terrain
     */
    public function terrain(): BelongsTo
    {
        return $this->belongsTo(TerrainSynthetiquesDakar::class, 'terrain_id');
    }

    /**
     * Relation avec la réservation (optionnelle)
     */
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    /**
     * Scope pour récupérer les avis approuvés
     */
    public function scopeApprouves($query)
    {
        return $query->where('est_approuve', true);
    }

    /**
     * Scope pour récupérer les avis d'un terrain
     */
    public function scopePourTerrain($query, $terrainId)
    {
        return $query->where('terrain_id', $terrainId);
    }

    /**
     * Scope pour récupérer les avis d'un utilisateur
     */
    public function scopePourUtilisateur($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Vérifier si un utilisateur a déjà laissé un avis pour un terrain
     */
    public static function utilisateurAdejaAvis($userId, $terrainId): bool
    {
        return static::where('user_id', $userId)
            ->where('terrain_id', $terrainId)
            ->exists();
    }
}
