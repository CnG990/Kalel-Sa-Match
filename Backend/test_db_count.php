<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Terrain;
use App\Models\Reservation;

echo "=== COMPTAGE DES DONNÉES ===\n";
echo "Users: " . User::count() . "\n";
echo "Terrains: " . Terrain::count() . "\n";
echo "Reservations: " . Reservation::count() . "\n";

// Vérifier les types d'utilisateurs
echo "\n=== TYPES D'UTILISATEURS ===\n";
$adminCount = User::where('role', 'admin')->count();
$managerCount = User::where('role', 'manager')->count();
$userCount = User::where('role', 'user')->count();

echo "Admins: $adminCount\n";
echo "Managers: $managerCount\n";
echo "Users: $userCount\n";

// Vérifier les notifications
echo "\n=== NOTIFICATIONS ===\n";
$notificationCount = \App\Models\Notification::count();
echo "Total notifications: $notificationCount\n";

echo "\n=== FIN ===\n";
