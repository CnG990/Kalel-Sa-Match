<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TypeAbonnement;

class TypeAbonnementSeeder extends Seeder
{
    public function run()
    {
        // Clear existing data
        TypeAbonnement::truncate();

        $typesAbonnements = [
            [
                'nom' => 'Abonnement Mensuel',
                'description' => 'Accès privilégié pendant 1 mois',
                'prix' => 0, // Prix calculé dynamiquement selon la configuration
                'duree_jours' => 30,
                'avantages' => [
                    'Réservations prioritaires',
                    '10% de réduction sur les équipements',
                    'Annulation gratuite jusqu\'à 2h avant'
                ],
                'categorie' => 'basic',
                'est_actif' => true,
                'est_visible' => true,
                'ordre_affichage' => 1,
                'nb_reservations_max' => 20,
                'reduction_pourcentage' => 10,
                'couleur_theme' => '#3B82F6',
                'icone' => 'calendar',
                'fonctionnalites_speciales' => ['priorite_reservation']
            ],
            [
                'nom' => 'Abonnement Trimestriel',
                'description' => 'Accès privilégié pendant 3 mois avec plus d\'avantages',
                'prix' => 0, // Prix calculé dynamiquement selon la configuration
                'duree_jours' => 90,
                'avantages' => [
                    'Réservations prioritaires',
                    '15% de réduction sur les équipements',
                    'Annulation gratuite jusqu\'à 2h avant',
                    'Accès aux événements VIP'
                ],
                'categorie' => 'premium',
                'est_actif' => true,
                'est_visible' => true,
                'ordre_affichage' => 2,
                'nb_reservations_max' => 60,
                'reduction_pourcentage' => 15,
                'couleur_theme' => '#10B981',
                'icone' => 'star',
                'fonctionnalites_speciales' => ['priorite_reservation', 'acces_vip']
            ],
            [
                'nom' => 'Abonnement Annuel',
                'description' => 'Accès privilégié pendant 1 an avec tous les avantages',
                'prix' => 0, // Prix calculé dynamiquement selon la configuration
                'duree_jours' => 365,
                'avantages' => [
                    'Réservations prioritaires',
                    '20% de réduction sur les équipements',
                    'Annulation gratuite jusqu\'à 2h avant',
                    'Accès aux événements VIP',
                    'Coach personnel mensuel inclus',
                    'Matériel de sport gratuit'
                ],
                'categorie' => 'entreprise',
                'est_actif' => true,
                'est_visible' => true,
                'ordre_affichage' => 3,
                'nb_reservations_max' => 365,
                'reduction_pourcentage' => 20,
                'couleur_theme' => '#F59E0B',
                'icone' => 'crown',
                'fonctionnalites_speciales' => ['priorite_reservation', 'acces_vip', 'coach_personnel']
            ]
        ];

        foreach ($typesAbonnements as $type) {
            TypeAbonnement::create($type);
        }
    }
}