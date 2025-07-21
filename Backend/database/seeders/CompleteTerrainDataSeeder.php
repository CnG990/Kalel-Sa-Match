<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompleteTerrainDataSeeder extends Seeder
{
    public function run()
    {
        $terrains = [
            [
                'nom' => 'Complexe Be Sport',
                'adresse' => 'Route de l\'Aéroport, Dakar',
                'prix_heure' => 45000,
                'capacite' => '11x11, 8x8, 5x5',
                'description' => 'Complexe sportif avec plusieurs terrains synthétiques de différentes tailles',
                'telephone' => '+221 77 123 45 67',
                'horaires' => '08:00-23:00',
                'latitude' => 14.7245,
                'longitude' => -17.4673,
                'commune' => 'Aéroport',
                'statut' => 'actif'
            ],
            [
                'nom' => 'Fara Foot',
                'adresse' => 'Fann-Point E-Amitié, Corniche, Dakar',
                'prix_heure' => 35000,
                'capacite' => '8x8, 5x5',
                'description' => 'Terrain synthétique sur la corniche près de Radisson',
                'telephone' => '+221 77 234 56 78',
                'horaires' => '08:00-06:00',
                'latitude' => 14.7167,
                'longitude' => -17.4567,
                'commune' => 'Fann-Point E-Amitié',
                'statut' => 'actif'
            ],
            [
                'nom' => 'Fit Park Academy',
                'adresse' => 'Route de la Corniche Ouest, Magic Land, Fann, Dakar',
                'prix_heure' => 80000,
                'capacite' => '11x11, 8x8, 5x5, 4x4',
                'description' => 'Académie de football avec terrains de différentes tailles',
                'telephone' => '+221 77 345 67 89',
                'horaires' => '08:00-23:00',
                'latitude' => 14.7189,
                'longitude' => -17.4589,
                'commune' => 'Fann',
                'statut' => 'actif'
            ],
            [
                'nom' => 'Skate Parc',
                'adresse' => 'Corniche Ouest, Dakar',
                'prix_heure' => 30000,
                'capacite' => '5x5, 8x8',
                'description' => 'Complexe avec terrain synthétique et skate park',
                'telephone' => '+221 77 456 78 90',
                'horaires' => '09:00-22:00',
                'latitude' => 14.7201,
                'longitude' => -17.4601,
                'commune' => 'Corniche',
                'statut' => 'actif'
            ],
            [
                'nom' => 'Sowfoot',
                'adresse' => 'Central Park Avenue Malick Sy X, Autoroute, Dakar',
                'prix_heure' => 27500,
                'capacite' => '11x11, 8x8, 5x5',
                'description' => 'Complexe sportif avec terrains synthétiques',
                'telephone' => '+221 77 567 89 01',
                'horaires' => '08:00-23:00',
                'latitude' => 14.7213,
                'longitude' => -17.4623,
                'commune' => 'Central Park',
                'statut' => 'actif'
            ],
            [
                'nom' => 'Stade Deggo',
                'adresse' => 'Marriste, Dakar',
                'prix_heure' => 22500,
                'capacite' => '11x11, 8x8',
                'description' => 'Stade avec terrain synthétique',
                'telephone' => '+221 77 678 90 12',
                'horaires' => '08:00-22:00',
                'latitude' => 14.7225,
                'longitude' => -17.4645,
                'commune' => 'Marriste',
                'statut' => 'actif'
            ],
            [
                'nom' => 'Terrain ASC Jaraaf',
                'adresse' => 'Médina, Dakar',
                'prix_heure' => 16500,
                'capacite' => '8x8, 5x5',
                'description' => 'Terrain de l\'ASC Jaraaf',
                'telephone' => '+221 77 789 01 23',
                'horaires' => '08:00-22:00',
                'latitude' => 14.7237,
                'longitude' => -17.4667,
                'commune' => 'Médina',
                'statut' => 'actif'
            ],
            [
                'nom' => 'TENNIS Mini Foot Squash',
                'adresse' => 'ASTU, Dakar 15441',
                'prix_heure' => 30000,
                'capacite' => '8x8, 16 joueurs max',
                'description' => 'Complexe avec terrain mini-foot et squash',
                'telephone' => '+221 77 890 12 34',
                'horaires' => '08:00-23:00',
                'latitude' => 14.7249,
                'longitude' => -17.4689,
                'commune' => 'ASTU',
                'statut' => 'actif'
            ],
            [
                'nom' => 'Temple du Foot',
                'adresse' => 'Dakar',
                'prix_heure' => 42500,
                'capacite' => 'Anfield, Camp Nou (salle), Old Trafford - 6x6, 5x5',
                'description' => 'Complexe avec 3 terrains : Anfield, Camp Nou (salle), Old Trafford. Réservation par Wave. Heures creuses (10h-18h) et pleines (18h-23h).',
                'telephone' => '+221 773238787',
                'horaires' => '10:00-23:00',
                'latitude' => 14.6868,
                'longitude' => -17.4547,
                'commune' => 'Dakar',
                'statut' => 'actif'
            ],
            [
                'nom' => 'Terrain École Police',
                'adresse' => 'École de Police, Dakar',
                'prix_heure' => 125000,
                'capacite' => '11x11',
                'description' => 'Terrain de football de l\'École de Police',
                'telephone' => '+221 77 901 23 45',
                'horaires' => '08:00-22:00',
                'latitude' => 14.7020,
                'longitude' => -17.4654,
                'commune' => 'École Police',
                'statut' => 'actif'
            ],
            [
                'nom' => 'Terrain Sacré Cœur',
                'adresse' => 'Sacré Cœur, Dakar',
                'prix_heure' => 27500,
                'capacite' => '11x11, 10x10, 8x8, 5x5',
                'description' => 'Centre de loisirs avec terrains de football. Tarifs : 5x5 (15,000f), 8x8 (30,000f), 10x10 (50,000f), 11x11 (60,000f)',
                'telephone' => '+221 780130725',
                'horaires' => '08:00-18:00',
                'latitude' => 14.7136,
                'longitude' => -17.4635,
                'commune' => 'Sacré Cœur',
                'statut' => 'actif'
            ],
            [
                'nom' => 'Terrain Thia',
                'adresse' => 'Dakar',
                'prix_heure' => 20000,
                'capacite' => '8x8, 5x5',
                'description' => 'Terrain de football Thia',
                'telephone' => '+221 77 012 34 56',
                'horaires' => '08:00-22:00',
                'latitude' => 14.7148,
                'longitude' => -17.4637,
                'commune' => 'Dakar',
                'statut' => 'actif'
            ]
        ];
        
        foreach ($terrains as $terrain) {
            DB::table('terrains')->insert([
                'nom' => $terrain['nom'],
                'adresse' => $terrain['adresse'],
                'prix_heure' => $terrain['prix_heure'],
                'capacite' => $terrain['capacite'],
                'description' => $terrain['description'],
                'telephone' => $terrain['telephone'],
                'horaires' => $terrain['horaires'],
                'latitude' => $terrain['latitude'],
                'longitude' => $terrain['longitude'],
                'commune' => $terrain['commune'],
                'statut' => $terrain['statut'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
} 