<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Builder;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'notifiable_type',
        'notifiable_id',
        'data',
        'read_at',
        'priority',
        'channel',
        'sent',
        'send_at'
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'send_at' => 'datetime',
        'sent' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relation polymorphe avec l'entité notifiable
     */
    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope pour les notifications non lues
     */
    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope pour les notifications lues
     */
    public function scopeRead(Builder $query): Builder
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Scope pour les notifications d'un utilisateur
     */
    public function scopeForUser(Builder $query, $userId): Builder
    {
        return $query->where('notifiable_type', User::class)
                    ->where('notifiable_id', $userId);
    }

    /**
     * Scope par priorité
     */
    public function scopeWithPriority(Builder $query, string $priority): Builder
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope pour les notifications à envoyer
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('sent', false)
                    ->where(function($q) {
                        $q->whereNull('send_at')
                          ->orWhere('send_at', '<=', now());
                    });
    }

    /**
     * Marquer comme lue
     */
    public function markAsRead(): bool
    {
        if ($this->read_at) {
            return false;
        }

        return $this->update(['read_at' => now()]);
    }

    /**
     * Marquer comme non lue
     */
    public function markAsUnread(): bool
    {
        return $this->update(['read_at' => null]);
    }

    /**
     * Vérifier si la notification est lue
     */
    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    /**
     * Créer une notification pour un utilisateur
     */
    public static function createForUser($user, string $type, array $data, string $priority = 'normal'): self
    {
        return static::create([
            'type' => $type,
            'notifiable_type' => get_class($user),
            'notifiable_id' => $user->id,
            'data' => $data,
            'priority' => $priority
        ]);
    }

    /**
     * Types de notifications prédéfinis
     */
    public const TYPES = [
        'RESERVATION_CONFIRMED' => 'reservation_confirmed',
        'RESERVATION_CANCELLED' => 'reservation_cancelled',
        'PAYMENT_RECEIVED' => 'payment_received',
        'PAYMENT_FAILED' => 'payment_failed',
        'REMINDER_UPCOMING_MATCH' => 'reminder_upcoming_match',
        'MANAGER_APPROVED' => 'manager_approved',
        'MANAGER_REJECTED' => 'manager_rejected',
        'NEW_MESSAGE' => 'new_message',
        'PRICE_CHANGED' => 'price_changed',
        'TERRAIN_UNAVAILABLE' => 'terrain_unavailable',
        'REFUND_PROCESSED' => 'refund_processed'
    ];
} 