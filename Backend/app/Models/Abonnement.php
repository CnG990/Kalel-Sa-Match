<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Abonnement extends Model
{
    protected $fillable = [
        'user_id', 'terrain_id', 'type_abonnement_id', 'type_abonnement', 'prix', 'date_debut', 'date_fin', 'statut',
        'nom', 'duree_jours', 'description', 'avantages', 'est_actif', 'categorie', 'est_visible', 'ordre_affichage',
        'nb_reservations_max', 'nb_terrains_favoris_max', 'reduction_pourcentage',
        'date_debut_validite', 'date_fin_validite', 'couleur_theme', 'icone', 'fonctionnalites_speciales'
    ];

    protected $casts = [
        'fonctionnalites_speciales' => 'array',
        'est_visible' => 'boolean',
        'date_debut_validite' => 'date',
        'date_fin_validite' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function terrain()
    {
        return $this->belongsTo(TerrainSynthetiquesDakar::class, 'terrain_id');
    }

    public function typeAbonnement()
    {
        return $this->belongsTo(TypeAbonnement::class, 'type_abonnement_id');
    }
}
