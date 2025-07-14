<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TerrainsSynthetiquesDakarSeeder extends Seeder
{
    public function run(): void
    {
        $terrains = [
            [
                'objectid' => 1,
                'gid' => 1,
                'name' => 'Complexe Be Sport',
                'area' => 470.067060402,
                'longitude' => -17.46907,
                'latitude' => 14.741066,
                'description' => 'Type: Football Surface: artificial_turf',
                'prix_heure' => 15000,
                'disponibilite' => true,
                'gestionnaire' => 'Be Sport',
                'telephone_contact' => '+221 77 123 45 67',
                'email_contact' => 'contact@besport.com',
                'horaires_ouverture' => '08:00',
                'horaires_fermeture' => '23:00',
                'etat' => 'Bon état',
                'equipements' => json_encode(['Vestiaires', 'Douches', 'Éclairage', 'Parking']),
                'capacite_spectateurs' => 100
            ],
            [
                'objectid' => 2,
                'gid' => 2,
                'name' => 'Fara Foot',
                'area' => 152.685476707,
                'longitude' => -17.47252,
                'latitude' => 14.697691,
                'description' => 'Type: Football Surface: artificial_turf',
                'prix_heure' => 12000,
                'disponibilite' => true,
                'gestionnaire' => 'Fara Sports',
                'telephone_contact' => '+221 77 234 56 78',
                'email_contact' => 'contact@farafoot.com',
                'horaires_ouverture' => '09:00',
                'horaires_fermeture' => '22:00',
                'etat' => 'Très bon état',
                'equipements' => json_encode(['Vestiaires', 'Éclairage', 'Parking', 'Buvette']),
                'capacite_spectateurs' => 150
            ],
            [
                'objectid' => 3,
                'gid' => 3,
                'name' => 'Fit Park Academy',
                'area' => 206.358665067,
                'longitude' => -17.463753,
                'latitude' => 14.674941,
                'description' => 'Type: Football Surface: artificial_turf',
                'prix_heure' => 13000,
                'disponibilite' => true,
                'gestionnaire' => 'Fit Park',
                'telephone_contact' => '+221 77 345 67 89',
                'email_contact' => 'contact@fitpark.com',
                'horaires_ouverture' => '07:00',
                'horaires_fermeture' => '23:00',
                'etat' => 'Excellent état',
                'equipements' => json_encode(['Vestiaires', 'Douches', 'Éclairage', 'Parking', 'Salle de musculation']),
                'capacite_spectateurs' => 200
            ],
            // Ajout des autres terrains avec leurs données géométriques
            [
                'objectid' => 4,
                'gid' => 4,
                'name' => 'Skate Parc',
                'area' => 297.202568553,
                'longitude' => -17.453209,
                'latitude' => 14.674382,
                'description' => 'Type: Football Surface: concrete',
                'prix_heure' => 10000,
                'disponibilite' => true,
                'gestionnaire' => 'Skate Parc Dakar',
                'telephone_contact' => '+221 77 456 78 90',
                'email_contact' => 'contact@skateparc.com',
                'horaires_ouverture' => '08:00',
                'horaires_fermeture' => '20:00',
                'etat' => 'État correct',
                'equipements' => json_encode(['Éclairage', 'Parking']),
                'capacite_spectateurs' => 50
            ],
            [
                'objectid' => 5,
                'gid' => 5,
                'name' => 'Sowfoot',
                'area' => 245.181416109,
                'longitude' => -17.441002,
                'latitude' => 14.683578,
                'description' => 'Type: Football Surface: artificial_turf',
                'prix_heure' => 12000,
                'disponibilite' => true,
                'gestionnaire' => 'Sowfoot Academy',
                'telephone_contact' => '+221 77 567 89 01',
                'email_contact' => 'contact@sowfoot.com',
                'horaires_ouverture' => '09:00',
                'horaires_fermeture' => '22:00',
                'etat' => 'Bon état',
                'equipements' => json_encode(['Vestiaires', 'Éclairage', 'Parking']),
                'capacite_spectateurs' => 120
            ],
            [
                'objectid' => 6,
                'gid' => 6,
                'name' => 'Stade Deggo',
                'area' => 301.501839744,
                'longitude' => -17.433923,
                'latitude' => 14.732331,
                'description' => 'Type: Football Surface: artificial_turf',
                'prix_heure' => 15000,
                'disponibilite' => true,
                'gestionnaire' => 'Commune Deggo',
                'telephone_contact' => '+221 77 678 90 12',
                'email_contact' => 'contact@stade-deggo.com',
                'horaires_ouverture' => '07:00',
                'horaires_fermeture' => '23:00',
                'etat' => 'Très bon état',
                'equipements' => json_encode(['Vestiaires', 'Douches', 'Éclairage', 'Parking', 'Tribune']),
                'capacite_spectateurs' => 300
            ],
            [
                'objectid' => 7,
                'gid' => 7,
                'name' => 'Stade Demba Diop',
                'area' => 866.450736791,
                'longitude' => -17.458398,
                'latitude' => 14.710875,
                'description' => 'Type: Football Surface: artificial_turf',
                'prix_heure' => 20000,
                'disponibilite' => true,
                'gestionnaire' => 'État du Sénégal',
                'telephone_contact' => '+221 33 789 01 23',
                'email_contact' => 'contact@stade-demba-diop.sn',
                'horaires_ouverture' => '06:00',
                'horaires_fermeture' => '23:00',
                'etat' => 'Excellent état',
                'equipements' => json_encode(['Vestiaires', 'Douches', 'Éclairage', 'Parking', 'Tribune', 'Salle de presse']),
                'capacite_spectateurs' => 15000
            ],
            [
                'objectid' => 8,
                'gid' => 8,
                'name' => 'Stade Iba Mar Diop',
                'area' => 557.138225372,
                'longitude' => -17.44668,
                'latitude' => 14.679646,
                'description' => 'Type: Football Surface: artificial_turf',
                'prix_heure' => 25000,
                'disponibilite' => true,
                'gestionnaire' => 'Fédération Sénégalaise de Football',
                'telephone_contact' => '+221 33 890 12 34',
                'email_contact' => 'contact@fsf.sn',
                'horaires_ouverture' => '06:00',
                'horaires_fermeture' => '23:00',
                'etat' => 'Excellent état',
                'equipements' => json_encode(['Vestiaires', 'Douches', 'Éclairage', 'Parking', 'Tribune', 'Salle de presse', 'Salle VIP']),
                'capacite_spectateurs' => 8000
            ],
            [
                'objectid' => 9,
                'gid' => 9,
                'name' => 'TEMPLE DU FOOT DAKAR / Foot & Padel / Sport Bar',
                'area' => 143.080077803,
                'longitude' => -17.454639,
                'latitude' => 14.686976,
                'description' => 'Type: Football Surface: artificial_turf',
                'prix_heure' => 15000,
                'disponibilite' => true,
                'gestionnaire' => 'Temple du Foot',
                'telephone_contact' => '+221 77 901 23 45',
                'email_contact' => 'contact@templedufoot.com',
                'horaires_ouverture' => '08:00',
                'horaires_fermeture' => '02:00',
                'etat' => 'Excellent état',
                'equipements' => json_encode(['Vestiaires', 'Douches', 'Éclairage', 'Parking', 'Bar', 'Restaurant', 'Terrain Padel']),
                'capacite_spectateurs' => 80
            ],
            [
                'objectid' => 10,
                'gid' => 10,
                'name' => 'Terrain mini foot Premier Projets Aréna',
                'area' => 105.997420041,
                'longitude' => -17.454791,
                'latitude' => 14.699351,
                'description' => 'Type: Football Surface: artificial_turf',
                'prix_heure' => 12000,
                'disponibilite' => true,
                'gestionnaire' => 'Premier Projets',
                'telephone_contact' => '+221 77 012 34 56',
                'email_contact' => 'contact@premierprojets.com',
                'horaires_ouverture' => '09:00',
                'horaires_fermeture' => '22:00',
                'etat' => 'Bon état',
                'equipements' => json_encode(['Vestiaires', 'Éclairage', 'Parking']),
                'capacite_spectateurs' => 60
            ],
            [
                'objectid' => 11,
                'gid' => 11,
                'name' => 'TENNIS Mini Foot Squash',
                'area' => 125.155850931,
                'longitude' => -17.468135,
                'latitude' => 14.68733,
                'description' => 'Type: Football Surface: artificial_turf',
                'prix_heure' => 13000,
                'disponibilite' => true,
                'gestionnaire' => 'Tennis Foot Squash Club',
                'telephone_contact' => '+221 77 123 45 67',
                'email_contact' => 'contact@tennisfootsquash.com',
                'horaires_ouverture' => '07:00',
                'horaires_fermeture' => '23:00',
                'etat' => 'Très bon état',
                'equipements' => json_encode(['Vestiaires', 'Douches', 'Éclairage', 'Parking', 'Courts de Tennis', 'Court de Squash']),
                'capacite_spectateurs' => 100
            ],
            [
                'objectid' => 12,
                'gid' => 12,
                'name' => 'Terrain Diaraf',
                'area' => 339.383857023,
                'longitude' => -17.452483,
                'latitude' => 14.68096,
                'description' => 'Type: Football Surface: artificial_turf',
                'prix_heure' => 15000,
                'disponibilite' => true,
                'gestionnaire' => 'Club Diaraf',
                'telephone_contact' => '+221 77 234 56 78',
                'email_contact' => 'contact@diaraf.com',
                'horaires_ouverture' => '08:00',
                'horaires_fermeture' => '22:00',
                'etat' => 'Excellent état',
                'equipements' => json_encode(['Vestiaires', 'Douches', 'Éclairage', 'Parking', 'Tribune']),
                'capacite_spectateurs' => 250
            ],
            [
                'objectid' => 13,
                'gid' => 13,
                'name' => 'Terrain ASC Liberté 6',
                'area' => 323.008703092,
                'longitude' => -17.462759,
                'latitude' => 14.726213,
                'description' => 'Type: Football Surface: artificial_turf',
                'prix_heure' => 12000,
                'disponibilite' => true,
                'gestionnaire' => 'ASC Liberté 6',
                'telephone_contact' => '+221 77 345 67 89',
                'email_contact' => 'contact@ascliberte6.com',
                'horaires_ouverture' => '09:00',
                'horaires_fermeture' => '21:00',
                'etat' => 'Bon état',
                'equipements' => json_encode(['Vestiaires', 'Éclairage', 'Parking']),
                'capacite_spectateurs' => 150
            ]
        ];

        foreach ($terrains as $terrain) {
            // Insérer d'abord les données de base
            DB::table('terrains_synthetiques_dakar')->insert($terrain);
            
            // Mettre à jour la géométrie PostGIS
            DB::statement("
                UPDATE terrains_synthetiques_dakar 
                SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326)
                WHERE objectid = ?
            ", [$terrain['longitude'], $terrain['latitude'], $terrain['objectid']]);
        }
        
        echo "✅ Seeder terminé : 13 terrains synthétiques de Dakar importés avec succès\n";
        echo "📍 Données géospatiales QGIS intégrées avec PostGIS\n";
    }
} 