<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favorite extends Model
{
    protected $fillable = [
        'user_id',
        'terrain_id'
    ];

    protected $casts = [
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
     * Scope pour récupérer les favoris d'un utilisateur
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Vérifier si un terrain est en favori pour un utilisateur
     */
    public static function isFavorite($userId, $terrainId): bool
    {
        return static::where('user_id', $userId)
            ->where('terrain_id', $terrainId)
            ->exists();
    }

    /**
     * Ajouter/retirer un favori (toggle)
     */
    public static function toggle($userId, $terrainId): array
    {
        $favorite = static::where('user_id', $userId)
            ->where('terrain_id', $terrainId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return ['action' => 'removed', 'is_favorite' => false];
        } else {
            static::create([
                'user_id' => $userId,
                'terrain_id' => $terrainId
            ]);
            return ['action' => 'added', 'is_favorite' => true];
        }
    }
} 