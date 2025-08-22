<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TypeAbonnement;

class TypeAbonnementSeeder extends Seeder
{
    public function run()
    {
        $typesAbonnements = [
            [
                'nom' => 'Abonnement Mensuel',
                'description' => 'Accès privilégié pendant 1 mois',
                'prix' => 50000,
                'duree_jours' => 30,
                'avantages' => [
                    'Réservations prioritaires',
                    'Tarifs préférentiels',
                    'Support client dédié'
                ],
                'categorie' => 'basic',
                'est_actif' => true,
                'est_visible' => true,
                'ordre_affichage' => 1,
                'couleur_theme' => '#3B82F6',
                'icone' => 'calendar'
            ],
            [
                'nom' => 'Abonnement Trimestriel',
                'description' => 'Accès privilégié pendant 3 mois',
                'prix' => 120000,
                'duree_jours' => 90,
                'avantages' => [
                    'Réservations prioritaires',
                    '15% de réduction sur les réservations',
                    'Support client dédié',
                    'Accès aux événements spéciaux'
                ],
                'categorie' => 'premium',
                'est_actif' => true,
                'est_visible' => true,
                'ordre_affichage' => 2,
                'couleur_theme' => '#F59E0B',
                'icone' => 'star'
            ],
            [
                'nom' => 'Abonnement Annuel',
                'description' => 'Accès illimité pendant 1 an',
                'prix' => 400000,
                'duree_jours' => 365,
                'avantages' => [
                    'Réservations illimitées',
                    '25% de réduction sur les réservations',
                    'Priorité sur les créneaux',
                    'Support client VIP',
                    'Coach personnel mensuel inclus',
                    'Accès aux événements VIP'
                ],
                'categorie' => 'premium',
                'est_actif' => true,
                'est_visible' => true,
                'ordre_affichage' => 3,
                'couleur_theme' => '#8B5CF6',
                'icone' => 'crown'
            ]
        ];

        foreach ($typesAbonnements as $type) {
            TypeAbonnement::updateOrCreate(
                ['nom' => $type['nom']],
                $type
            );
        }
    }
} 