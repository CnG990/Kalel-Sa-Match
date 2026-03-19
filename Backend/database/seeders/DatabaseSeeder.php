<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Créer l'administrateur principal
        User::updateOrCreate(
            ['email' => 'admin@terrains-dakar.com'],
            [
                'nom' => 'Administrateur',
                'prenom' => 'Principal',
                'mot_de_passe' => Hash::make('Admin123!'),
                'role' => 'admin',
                'statut_validation' => 'approuve',
                'telephone' => '+221331234567',
                'email_verified_at' => now(),
            ]
        );
        
        // Créer un deuxième compte admin pour les tests
        User::updateOrCreate(
            ['email' => 'admin@terrains.com'],
            [
                'nom' => 'Test',
                'prenom' => 'Admin',
                'mot_de_passe' => Hash::make('password'),
                'role' => 'admin',
                'statut_validation' => 'approuve',
                'telephone' => '+221331234568',
                'email_verified_at' => now(),
            ]
        );

        // Créer un gestionnaire validé pour les tests
        User::updateOrCreate(
            ['email' => 'gestionnaire@terrains-dakar.com'],
            [
                'nom' => 'Gestionnaire',
                'prenom' => 'Principal',
                'mot_de_passe' => Hash::make('Gestionnaire123!'),
                'role' => 'gestionnaire',
                'statut_validation' => 'approuve', // Gestionnaire validé pour les tests
                'telephone' => '+221771234567',
                'email_verified_at' => now(),
            ]
        );

        // Créer un gestionnaire en attente de validation
        User::updateOrCreate(
            ['email' => 'gestionnaire@test.com'],
            [
                'nom' => 'Test',
                'prenom' => 'Gestionnaire',
                'mot_de_passe' => Hash::make('password'),
                'role' => 'gestionnaire',
                'statut_validation' => 'en_attente', // Ce gestionnaire devra être approuvé
                'telephone' => '+221771234568',
                'email_verified_at' => now(),
            ]
        );

        // Créer un client principal pour les tests
        User::updateOrCreate(
            ['email' => 'client@terrains-dakar.com'],
            [
                'nom' => 'Client',
                'prenom' => 'Principal',
                'mot_de_passe' => Hash::make('Client123!'),
                'role' => 'client',
                'statut_validation' => 'approuve', // Les clients sont approuvés d'office
                'telephone' => '+221762345678',
                'email_verified_at' => now(),
            ]
        );

        // Créer un client de test
        User::updateOrCreate(
            ['email' => 'client@test.com'],
            [
                'nom' => 'Test',
                'prenom' => 'Client',
                'mot_de_passe' => Hash::make('password'),
                'role' => 'client',
                'statut_validation' => 'approuve', // Les clients sont approuvés d'office
                'telephone' => '+221762345679',
                'email_verified_at' => now(),
            ]
        );
        
        echo "✅ Utilisateurs de test créés ou mis à jour\n";
        echo "👑 Admin principal: admin@terrains-dakar.com / Admin123!\n";
        echo "🏢 Gestionnaire validé: gestionnaire@terrains-dakar.com / Gestionnaire123!\n";
        echo "👤 Client principal: client@terrains-dakar.com / Client123!\n";

        // Appeler le seeder des terrains synthétiques de Dakar (13 terrains)
        $this->call([
            TerrainsSynthetiquesDakarSeeder::class,
        ]);

        echo "🏆 Base de données initialisée avec succès !\n";
        echo "📊 13 terrains synthétiques de Dakar avec données GPS\n";
        echo "👥 6 utilisateurs de test (2 Admin, 2 Gestionnaires, 2 Clients)\n";
        echo "\n🔑 COMPTES DE TEST:\n";
        echo "   Admin: admin@terrains-dakar.com / Admin123!\n";
        echo "   Gestionnaire: gestionnaire@terrains-dakar.com / Gestionnaire123!\n";
        echo "   Client: client@terrains-dakar.com / Client123!\n";
    }
}
