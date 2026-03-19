<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Abonnement;

class AbonnementSeeder extends Seeder
{
    public function run()
    {
        // Supprimer les abonnements existants
        Abonnement::truncate();

        // Créer les abonnements de base
        $abonnements = [
            [
                'id' => 1,
                'nom' => 'Abonnement Mensuel',
                'prix' => 0, // Prix calculé dynamiquement selon la configuration
                'duree_jours' => 30,
                'description' => 'Accès illimité pendant 1 mois',
                'avantages' => '["Réservations illimitées", "Support prioritaire"]',
                'est_actif' => true,
                'categorie' => 'basic',
                'est_visible' => true,
                'ordre_affichage' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'nom' => 'Abonnement Trimestriel',
                'prix' => 0, // Prix calculé dynamiquement selon la configuration
                'duree_jours' => 90,
                'description' => 'Accès illimité pendant 3 mois',
                'avantages' => '["Réservations illimitées", "Support prioritaire", "Réduction 10%"]',
                'est_actif' => true,
                'categorie' => 'basic',
                'est_visible' => true,
                'ordre_affichage' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'nom' => 'Abonnement Annuel',
                'prix' => 0, // Prix calculé dynamiquement selon la configuration
                'duree_jours' => 365,
                'description' => 'Accès illimité pendant 1 an',
                'avantages' => '["Réservations illimitées", "Support prioritaire", "Réduction 20%", "Accès VIP"]',
                'est_actif' => true,
                'categorie' => 'premium',
                'est_visible' => true,
                'ordre_affichage' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($abonnements as $abonnement) {
            Abonnement::create($abonnement);
        }

        $this->command->info('Abonnements de base créés avec succès !');
    }
} 