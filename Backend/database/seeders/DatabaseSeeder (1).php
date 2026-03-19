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
        // Créer les utilisateurs de test avec la nouvelle structure
        
        // Admin
        User::create([
            'nom' => 'Admin',
            'prenom' => 'Principal',
            'email' => 'admin@terrains-synthetiques.com',
            'mot_de_passe' => Hash::make('password'),
            'telephone' => '+221 33 123 45 67',
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Gestionnaire de test
        User::create([
            'nom' => 'Diop',
            'prenom' => 'Mamadou',
            'email' => 'gestionnaire@besport.com',
            'mot_de_passe' => Hash::make('password'),
            'telephone' => '+221 77 123 45 67',
            'role' => 'gestionnaire',
            'email_verified_at' => now(),
        ]);

        // Client de test
        User::create([
            'nom' => 'Sow',
            'prenom' => 'Fatou',
            'email' => 'client@example.com',
            'mot_de_passe' => Hash::make('password'),
            'telephone' => '+221 76 234 56 78',
            'role' => 'client',
            'email_verified_at' => now(),
        ]);

        echo "✅ Utilisateurs de test créés\n";

        // Appeler le seeder des terrains QGIS
        $this->call([
            TerrainsSynthetiquesDakarSeeder::class,
        ]);

        echo "🏆 Base de données initialisée avec succès !\n";
        echo "📊 13 terrains synthétiques de Dakar avec données QGIS\n";
        echo "👥 3 utilisateurs de test (Admin, Gestionnaire, Client)\n";
    }
}
