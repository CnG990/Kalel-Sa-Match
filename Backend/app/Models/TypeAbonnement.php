<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TypeAbonnement extends Model
{
    use SoftDeletes;

    protected $table = 'types_abonnements';

    protected $fillable = [
        'nom', 'description', 'prix', 'duree_jours', 'avantages', 'est_actif',
        'categorie', 'est_visible', 'ordre_affichage', 'nb_reservations_max',
        'nb_terrains_favoris_max', 'reduction_pourcentage', 'date_debut_validite',
        'date_fin_validite', 'couleur_theme', 'icone', 'fonctionnalites_speciales'
    ];

    protected $casts = [
        'avantages' => 'array',
        'fonctionnalites_speciales' => 'array',
        'est_actif' => 'boolean',
        'est_visible' => 'boolean',
        'date_debut_validite' => 'date',
        'date_fin_validite' => 'date',
    ];

    public function abonnements()
    {
        return $this->hasMany(Abonnement::class, 'type_abonnement_id');
    }
}
