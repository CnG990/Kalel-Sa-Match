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
                'description' => 'Type: Football, Surface: gazon synthétique. Idéal pour les matchs amicaux et les entraînements.',
                'adresse' => 'Route de l\'Aéroport, près de l\'ancien aéroport, Dakar',
                'latitude' => 14.741066,
                'longitude' => -17.46907,
                'prix_heure' => 18000,
                'capacite' => 22,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Fara Foot',
                'description' => 'Un terrain moderne pour le football à 5. Ambiance conviviale garantie.',
                'adresse' => 'Sacré-Cœur, Dakar',
                'latitude' => 14.697691,
                'longitude' => -17.47252,
                'prix_heure' => 15000,
                'capacite' => 10,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Fit Park Academy',
                'description' => 'Complexe multisports avec un terrain de foot de qualité supérieure.',
                'adresse' => 'Mermoz, Dakar',
                'latitude' => 14.674941,
                'longitude' => -17.463753,
                'prix_heure' => 20000,
                'capacite' => 22,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Skate Parc',
                'description' => 'Terrain polyvalent, idéal pour le street football.',
                'adresse' => 'Corniche Ouest, Dakar',
                'latitude' => 14.674382,
                'longitude' => -17.453209,
                'prix_heure' => 12000,
                'capacite' => 14,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Sowfoot',
                'description' => 'Terrain de quartier bien entretenu, parfait pour les passionnés.',
                'adresse' => 'Grand Yoff, Dakar',
                'latitude' => 14.683578,
                'longitude' => -17.441002,
                'prix_heure' => 14000,
                'capacite' => 18,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Stade Deggo',
                'description' => 'Grand terrain avec des installations complètes pour des matchs officiels.',
                'adresse' => 'Parcelles Assainies, Dakar',
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
                'description' => 'Terrain historique du club ASC Jaraaf, pelouse synthétique de qualité.',
                'adresse' => 'Médina, Dakar',
                'latitude' => 14.6928,
                'longitude' => -17.4467,
                'prix_heure' => 16000,
                'capacite' => 22,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Stade LSS',
                'description' => 'Terrain moderne de Linguère Sporting Saint-Louis, aux normes FIFA.',
                'adresse' => 'Guédiawaye',
                'latitude' => 14.7644,
                'longitude' => -17.4138,
                'prix_heure' => 22000,
                'capacite' => 22,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Complexe Sportif Parcelles',
                'description' => 'Complexe sportif moderne avec plusieurs terrains de qualité.',
                'adresse' => 'Parcelles Assainies',
                'latitude' => 14.7797,
                'longitude' => -17.3944,
                'prix_heure' => 19000,
                'capacite' => 18,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Terrain Yoff',
                'description' => 'Terrain communautaire bien entretenu, idéal pour les tournois de quartier.',
                'adresse' => 'Yoff Virage',
                'latitude' => 14.7392,
                'longitude' => -17.4692,
                'prix_heure' => 13000,
                'capacite' => 20,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Stade de Pikine',
                'description' => 'Grand stade avec terrain synthétique, équipements modernes.',
                'adresse' => 'Pikine',
                'latitude' => 14.7547,
                'longitude' => -17.3927,
                'prix_heure' => 17000,
                'capacite' => 22,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Terrain Ouakam',
                'description' => 'Terrain en bord de mer, ambiance unique pour vos matchs.',
                'adresse' => 'Ouakam',
                'latitude' => 14.7158,
                'longitude' => -17.4853,
                'prix_heure' => 21000,
                'capacite' => 22,
                'surface' => null,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
            ],
            [
                'nom' => 'Complexe HLM',
                'description' => 'Terrain de quartier populaire, très fréquenté par les jeunes.',
                'adresse' => 'HLM Grand Yoff',
                'latitude' => 14.7003,
                'longitude' => -17.4421,
                'prix_heure' => 11000,
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
        
        echo "✅ 13 terrains synthétiques de Dakar créés ou mis à jour avec géométries PostGIS\n";
    }
} 