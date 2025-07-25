<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\TerrainSynthetiquesDakar;

class TerrainsSynthetiquesDakarSeeder extends Seeder
{
    public function run(): void
    {
        $terrains = [
            [
                'nom' => 'Complexe Be Sport',
                'description' => 'Complexe Be Sport - Tarifs variables selon terrain et jour. Petit terrain : 30,000 FCFA. Grand terrain : 45,000 FCFA (lundi-mercredi), 60,000 FCFA (jeudi-dimanche). Surface gazon synthétique.',
                'adresse' => 'Route de l\'Aéroport, près de l\'ancien aéroport, Dakar',
                'latitude' => 14.741066,
                'longitude' => -17.46907,
                'prix_heure' => 45000, // Prix moyen du grand terrain
                'capacite' => 22,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Fara Foot',
                'description' => 'Fara Foot - Tarifs selon horaires. 8h-15h : 30,000 FCFA/h. 16h-6h : 40,000 FCFA/h. Terrain synthétique sur la corniche près de Radisson.',
                'adresse' => 'Fann-Point E-Amitié, Corniche, Dakar',
                'latitude' => 14.697691,
                'longitude' => -17.47252,
                'prix_heure' => 35000, // Prix moyen entre jour/nuit
                'capacite' => 10,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Fit Park Academy',
                'description' => 'Fit Park Academy - Tarifs selon taille terrain. 4x4/5x5 : 30,000 FCFA. 8x8/9x9 : 80,000 FCFA. 11x11 : 120,000 FCFA. Académie avec terrains multiples.',
                'adresse' => 'Route de la Corniche Ouest, Magic Land, Fann, Dakar',
                'latitude' => 14.674941,
                'longitude' => -17.463753,
                'prix_heure' => 80000, // Prix terrain 8x8/9x9 (le plus utilisé)
                'capacite' => 22,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Skate Parc',
                'description' => 'Skate Parc - 30,000 FCFA/h. Complexe avec terrain synthétique et skate park. Terrain polyvalent, idéal pour le street football.',
                'adresse' => 'Corniche Ouest, Dakar',
                'latitude' => 14.674382,
                'longitude' => -17.453209,
                'prix_heure' => 30000,
                'capacite' => 14,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Sowfoot',
                'description' => 'Sowfoot - Tarifs selon taille et jour. 5x5 : 15,000 FCFA (dimanche 90mn), 20,000 FCFA (vendredi-samedi 1h). 8x8 : 35,000 FCFA (dimanche-jeudi 1h30), 40,000 FCFA (vendredi-samedi 1h). Crampons interdits, tout-terrains seulement.',
                'adresse' => 'Central Park Avenue Malick Sy X, Autoroute, Dakar',
                'latitude' => 14.683578,
                'longitude' => -17.441002,
                'prix_heure' => 25000, // Prix moyen entre 5x5 et 8x8
                'capacite' => 18,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Stade Deggo',
                'description' => 'Stade Deggo - 25,000 FCFA/h. Grand terrain avec des installations complètes pour des matchs officiels.',
                'adresse' => 'Marriste, Dakar',
                'latitude' => 14.732331,
                'longitude' => -17.433923,
                'prix_heure' => 25000,
                'capacite' => 22,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Terrain ASC Jaraaf',
                'description' => 'Terrain ASC Jaraaf - 25,000 FCFA/h. Terrain historique du club ASC Jaraaf, pelouse synthétique de qualité.',
                'adresse' => 'Médina, Dakar',
                'latitude' => 14.6928,
                'longitude' => -17.4467,
                'prix_heure' => 25000,
                'capacite' => 22,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'TENNIS Mini Foot Squash',
                'description' => 'TENNIS Mini Foot Squash - 30,000 FCFA/h. Complexe avec terrain mini-foot et squash. Capacité 16 joueurs, format 8x8.',
                'adresse' => 'ASTU, Dakar 15441',
                'latitude' => 14.7003,
                'longitude' => -17.4421,
                'prix_heure' => 30000,
                'capacite' => 16,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Temple du Foot',
                'description' => 'Temple du Foot - Tarifs selon horaires. Heures creuses (10h-18h) : 35,000 FCFA. Heures pleines (18h-23h) : 50,000 FCFA. Complexe avec 3 terrains : Anfield, Camp Nou (salle), Old Trafford. Capacité 6x6, 5x5. Réservation par Wave.',
                'adresse' => 'Dakar',
                'latitude' => 14.6868,
                'longitude' => -17.4547,
                'prix_heure' => 42500, // Prix moyen entre heures creuses et pleines
                'capacite' => 18,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Terrain École Police',
                'description' => 'Terrain École Police - 125,000 FCFA/h. Terrain de football de l\'École de Police. Terrain officiel avec installations complètes.',
                'adresse' => 'École de Police, Dakar',
                'latitude' => 14.7020,
                'longitude' => -17.4654,
                'prix_heure' => 125000,
                'capacite' => 22,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Terrain Sacré Cœur',
                'description' => 'Terrain Sacré Cœur - Tarifs selon taille terrain. 5x5 : 15,000 FCFA. 8x8 : 30,000 FCFA. 10x10 : 50,000 FCFA. 11x11 : 60,000 FCFA. Centre de loisirs avec terrains multiples.',
                'adresse' => 'Sacré Cœur, Dakar',
                'latitude' => 14.7136,
                'longitude' => -17.4635,
                'prix_heure' => 35000, // Prix moyen entre 8x8 et 10x10 (les plus utilisés)
                'capacite' => 22,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Terrain Thia',
                'description' => 'Terrain Thia - 20,000 FCFA/h. Terrain de football Thia. Capacité 8x8, 5x5.',
                'adresse' => 'Dakar',
                'latitude' => 14.7148,
                'longitude' => -17.4637,
                'prix_heure' => 20000,
                'capacite' => 16,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
        ];

        foreach ($terrains as $terrainData) {
            // Créer ou mettre à jour le terrain
            $terrain = TerrainSynthetiquesDakar::updateOrCreate(
                ['nom' => $terrainData['nom']], // Clé pour trouver et mettre à jour
                $terrainData
            );
            
            // Créer la géométrie PostGIS à partir des coordonnées
            if ($terrain->latitude && $terrain->longitude) {
                DB::statement("
                    UPDATE terrains_synthetiques_dakar 
                    SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326)
                    WHERE id = ?
                ", [$terrain->longitude, $terrain->latitude, $terrain->id]);
            }
        }
        
        echo "✅ 12 terrains synthétiques de Dakar créés ou mis à jour avec géométries PostGIS\n";
    }
} 