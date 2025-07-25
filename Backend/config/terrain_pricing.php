<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Pricing Factors
    |--------------------------------------------------------------------------
    |
    | Ces facteurs définissent les limites acceptables pour les prix
    | d'abonnements et réservations
    |
    */

    'validation' => [
        'subscription_price_min_factor' => 0.5,  // Prix min = 50% du prix de base
        'subscription_price_max_factor' => 10,   // Prix max = 10x le prix de base
        'recurring_price_min_factor' => 0.5,     // Prix min récurrent = 50%
        'recurring_price_max_factor' => 2,       // Prix max récurrent = 200%
    ],

    /*
    |--------------------------------------------------------------------------
    | Terrain-specific Pricing Rules
    |--------------------------------------------------------------------------
    |
    | Règles de tarification spécifiques par terrain
    |
    */

    'terrain_rules' => [
        'sowfoot' => [
            '5x5' => [
                'dimanche' => [
                    '1h' => ['base_multiplier' => 0.6],      // 60% du prix de base
                    '1h30' => ['base_multiplier' => 0.8],    // 80% du prix de base
                ],
                'weekend' => [
                    '1h' => ['base_multiplier' => 0.8],      // 80% du prix de base
                    // Pas de 1h30 en weekend
                ],
            ],
            '8x8' => [
                'semaine' => [
                    '1h' => ['base_multiplier' => 1.2],      // 120% du prix de base
                    '1h30' => ['base_multiplier' => 1.4],    // 140% du prix de base
                ],
                'weekend' => [
                    '1h' => ['base_multiplier' => 1.4],      // 140% du prix de base
                    // Pas de 1h30 en weekend
                ],
            ],
        ],

        'complexe_be_sport' => [
            'petit_terrain' => ['base_multiplier' => 1.0],
            'grand_terrain_semaine' => ['base_multiplier' => 1.5],
            'grand_terrain_weekend' => ['base_multiplier' => 2.0],
        ],

        'fara_foot' => [
            'jour' => ['base_multiplier' => 1.0],
            'nuit' => ['base_multiplier' => 1.33],
        ],

        'fit_park_academy' => [
            '5x5' => ['base_multiplier' => 1.0],
            '8x8' => ['base_multiplier' => 2.67],
            '11x11' => ['base_multiplier' => 4.0],
        ],

        'temple_du_foot' => [
            'heures_creuses' => ['base_multiplier' => 1.0],
            'heures_pleines' => ['base_multiplier' => 1.33],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Duration Extra Costs
    |--------------------------------------------------------------------------
    |
    | Coûts supplémentaires pour les durées étendues
    |
    */

    'duration_extras' => [
        '90_minutes_extra' => 5000, // +5000 FCFA pour passer de 1h à 1h30
    ],

    /*
    |--------------------------------------------------------------------------
    | Subscription Multipliers
    |--------------------------------------------------------------------------
    |
    | Multiplicateurs pour les différents types d'abonnements
    |
    */

    'subscription_multipliers' => [
        'mensuel' => 4,     // 4 semaines
        'trimestriel' => 12, // 12 semaines
        'annuel' => 48,     // 48 semaines
    ],

    /*
    |--------------------------------------------------------------------------
    | Loyalty Discounts
    |--------------------------------------------------------------------------
    |
    | Système de réductions fidélité
    |
    */

    'loyalty' => [
        'nouveau' => ['min_points' => 0, 'max_points' => 50, 'discount' => 0],
        'bronze' => ['min_points' => 51, 'max_points' => 150, 'discount' => 5],
        'argent' => ['min_points' => 151, 'max_points' => 300, 'discount' => 10],
        'or' => ['min_points' => 301, 'max_points' => 500, 'discount' => 15],
        'platine' => ['min_points' => 501, 'max_points' => 9999, 'discount' => 20],
    ],

]; 