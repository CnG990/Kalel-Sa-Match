<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestAccountsSeeder extends Seeder
{
    public function run(): void
    {
        // Comptes de test pour les différents rôles

        // 1. Admin principal
        User::updateOrCreate(
            ['email' => 'admin@terrasyn.sn'],
            [
                'nom' => 'Diallo',
                'prenom' => 'Cheikh',
                'email' => 'admin@terrasyn.sn',
                'mot_de_passe' => Hash::make('admin123'),
                'telephone' => '+221 77 123 4567',
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 2. Gestionnaire de test
        User::updateOrCreate(
            ['email' => 'gestionnaire@terrasyn.sn'],
            [
                'nom' => 'Ba',
                'prenom' => 'Mamadou',
                'email' => 'gestionnaire@terrasyn.sn',
                'mot_de_passe' => Hash::make('gestionnaire123'),
                'telephone' => '+221 76 234 5678',
                'role' => 'gestionnaire',
                'email_verified_at' => now(),
            ]
        );

        // 3. Client de test
        User::updateOrCreate(
            ['email' => 'client@terrasyn.sn'],
            [
                'nom' => 'Ndiaye',
                'prenom' => 'Fatou',
                'email' => 'client@terrasyn.sn',
                'mot_de_passe' => Hash::make('client123'),
                'telephone' => '+221 78 345 6789',
                'role' => 'client',
                'email_verified_at' => now(),
            ]
        );

        // 4. Autres comptes utiles
        User::updateOrCreate(
            ['email' => 'cheikh.diallo@terrasyn.sn'],
            [
                'nom' => 'Diallo',
                'prenom' => 'Cheikh',
                'email' => 'cheikh.diallo@terrasyn.sn',
                'mot_de_passe' => Hash::make('cheikh2025'),
                'telephone' => '+221 77 555 0123',
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'manager.test@terrasyn.sn'],
            [
                'nom' => 'Sow',
                'prenom' => 'Aminata',
                'email' => 'manager.test@terrasyn.sn',
                'mot_de_passe' => Hash::make('manager123'),
                'telephone' => '+221 77 888 9999',
                'role' => 'gestionnaire',
                'email_verified_at' => now(),
            ]
        );

        echo "✅ 5 comptes de test créés avec succès\n";
        echo "🔐 LOGINS DE CONNEXION :\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "👑 ADMIN PRINCIPAL:\n";
        echo "   Email: admin@terrasyn.sn\n";
        echo "   Mot de passe: admin123\n";
        echo "\n";
        echo "🏢 GESTIONNAIRE:\n";
        echo "   Email: gestionnaire@terrasyn.sn\n";
        echo "   Mot de passe: gestionnaire123\n";
        echo "\n";
        echo "👤 CLIENT:\n";
        echo "   Email: client@terrasyn.sn\n";
        echo "   Mot de passe: client123\n";
        echo "\n";
        echo "👨‍💼 COMPTE PERSONNEL CHEIKH:\n";
        echo "   Email: cheikh.diallo@terrasyn.sn\n";
        echo "   Mot de passe: cheikh2025\n";
        echo "\n";
        echo "🎯 MANAGER TEST:\n";
        echo "   Email: manager.test@terrasyn.sn\n";
        echo "   Mot de passe: manager123\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    }
} 