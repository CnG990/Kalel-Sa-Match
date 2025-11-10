<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TerrainSynthetiquesDakar;
use Illuminate\Support\Facades\DB;

class MbourTerrainsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $terrains = [
            [
                'nom' => 'Foot7+',
                'description' => 'Foot7+ - Terrain de football synthétique à Mbour. Idéal pour les matchs et entraînements.',
                'adresse' => 'Mbour, Sénégal',
                'latitude' => 14.4399, // Centre du polygon calculé
                'longitude' => -16.9779, // Centre du polygon calculé
                'prix_heure' => 20000, // Prix par défaut, à ajuster selon les tarifs réels
                'capacite' => 14, // Foot7 = 7v7 = 14 joueurs
                'surface' => null,
                'gestionnaire_id' => null, // À associer à un gestionnaire si nécessaire
                'contact_telephone' => null,
                'email_contact' => null,
                'horaires_ouverture' => '08:00:00',
                'horaires_fermeture' => '23:00:00',
                'type_surface' => 'synthétique',
                'equipements' => null,
                'regles_maison' => null,
                'note_moyenne' => 0,
                'nombre_avis' => 0,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
                'jours_disponibles' => ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
                'creneaux_disponibles' => ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'],
                'conditions_abonnement' => null,
                'accepte_paiement_differe' => true,
                'acompte_minimum' => null,
                'duree_engagement_minimum' => 30,
                'reductions_abonnement' => null,
            ],
            [
                'nom' => 'Mini-Foot Auchan',
                'description' => 'Mini-Foot Auchan - Terrain de mini-foot situé à Mbour près du centre commercial Auchan. Parfait pour les matchs rapides.',
                'adresse' => 'Mbour, près d\'Auchan, Sénégal',
                'latitude' => 14.4279, // Centre du polygon calculé
                'longitude' => -16.9739, // Centre du polygon calculé
                'prix_heure' => 15000, // Prix par défaut, à ajuster selon les tarifs réels
                'capacite' => 10, // Mini-foot = 5v5 = 10 joueurs
                'surface' => null,
                'gestionnaire_id' => null,
                'contact_telephone' => null,
                'email_contact' => null,
                'horaires_ouverture' => '08:00:00',
                'horaires_fermeture' => '23:00:00',
                'type_surface' => 'synthétique',
                'equipements' => null,
                'regles_maison' => null,
                'note_moyenne' => 0,
                'nombre_avis' => 0,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
                'jours_disponibles' => ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
                'creneaux_disponibles' => ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'],
                'conditions_abonnement' => null,
                'accepte_paiement_differe' => true,
                'acompte_minimum' => null,
                'duree_engagement_minimum' => 30,
                'reductions_abonnement' => null,
            ],
            [
                'nom' => 'Rara Complexe',
                'description' => 'Rara Complexe - Complexe sportif à Mbour avec terrain de football synthétique. Installations modernes et bien entretenues.',
                'adresse' => 'Mbour, Sénégal',
                'latitude' => 14.4300, // Coordonnées approximatives Mbour, à ajuster si vous avez le KML
                'longitude' => -16.9700, // Coordonnées approximatives Mbour, à ajuster si vous avez le KML
                'prix_heure' => 25000, // Prix par défaut, à ajuster selon les tarifs réels
                'capacite' => 22, // Terrain standard 11v11
                'surface' => null,
                'gestionnaire_id' => null,
                'contact_telephone' => null,
                'email_contact' => null,
                'horaires_ouverture' => '08:00:00',
                'horaires_fermeture' => '23:00:00',
                'type_surface' => 'synthétique',
                'equipements' => null,
                'regles_maison' => null,
                'note_moyenne' => 0,
                'nombre_avis' => 0,
                'image_principale' => '/terrain-foot.jpg',
                'images_supplementaires' => null,
                'est_actif' => true,
                'jours_disponibles' => ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
                'creneaux_disponibles' => ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'],
                'conditions_abonnement' => null,
                'accepte_paiement_differe' => true,
                'acompte_minimum' => null,
                'duree_engagement_minimum' => 30,
                'reductions_abonnement' => null,
            ],
        ];

        foreach ($terrains as $terrain) {
            // Vérifier si le terrain existe déjà
            $existing = TerrainSynthetiquesDakar::where('nom', $terrain['nom'])
                ->where('adresse', 'like', '%Mbour%')
                ->first();

            if (!$existing) {
                TerrainSynthetiquesDakar::create($terrain);
                $this->command->info("✅ Terrain créé: {$terrain['nom']}");
            } else {
                $this->command->warn("⚠️  Terrain déjà existant: {$terrain['nom']}");
            }
        }

        $this->command->info('✅ Import des terrains de Mbour terminé !');
    }
}

