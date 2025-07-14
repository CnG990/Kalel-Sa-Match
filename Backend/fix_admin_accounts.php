<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VÉRIFICATION ET RÉPARATION COMPTES ADMIN ===\n\n";

use App\Models\User;
use Illuminate\Support\Facades\Hash;

try {
    // Vérifier les comptes existants
    $users = User::all();
    echo "Total utilisateurs dans la base: " . $users->count() . "\n\n";

    echo "COMPTES EXISTANTS:\n";
    foreach ($users as $user) {
        echo "- {$user->email} (role: {$user->role})\n";
    }

    echo "\n=== CRÉATION/MISE À JOUR COMPTES ADMIN ===\n";

    // Créer/Mettre à jour les comptes admin avec les bons mots de passe
    $admins = [
        [
            'email' => 'admin@terrains-dakar.com',
            'password' => 'Admin123!',
            'nom' => 'Administrateur',
            'prenom' => 'Principal'
        ],
        [
            'email' => 'admin@terrasyn.sn', 
            'password' => 'admin123',
            'nom' => 'Admin',
            'prenom' => 'Test'
        ],
        [
            'email' => 'admin@terrains.com',
            'password' => 'password',
            'nom' => 'Admin',
            'prenom' => 'Alternatif'
        ]
    ];

    foreach ($admins as $admin) {
        $user = User::updateOrCreate(
            ['email' => $admin['email']],
            [
                'nom' => $admin['nom'],
                'prenom' => $admin['prenom'],
                'mot_de_passe' => Hash::make($admin['password']),
                'role' => 'admin',
                'statut_validation' => 'approuve',
                'telephone' => '+221331234567',
                'email_verified_at' => now(),
            ]
        );
        
        echo "✅ {$admin['email']} / {$admin['password']}\n";
    }

    echo "\n=== TEST CONNEXION ===\n";

    // Tester la connexion avec chaque compte
    foreach ($admins as $admin) {
        $email = $admin['email'];
        $password = $admin['password'];

        $user = User::where('email', $email)->first();
        if ($user) {
            echo "\nTest: {$email}\n";
            echo "Hash: " . substr($user->mot_de_passe, 0, 20) . "...\n";
            
            if (Hash::check($password, $user->mot_de_passe)) {
                echo "✅ Mot de passe CORRECT\n";
            } else {
                echo "❌ Mot de passe INCORRECT\n";
            }
        } else {
            echo "❌ Utilisateur {$email} non trouvé\n";
        }
    }

    echo "\n=== RÉSUMÉ FINAL ===\n";
    echo "🔑 Comptes admin disponibles pour la connexion:\n";
    echo "   admin@terrains-dakar.com / Admin123!\n";
    echo "   admin@terrasyn.sn / admin123\n";
    echo "   admin@terrains.com / password\n\n";
    
    echo "🌐 URL de connexion: http://127.0.0.1:5175/login\n";
    echo "✅ Tous les comptes sont maintenant opérationnels !\n";

} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
} 