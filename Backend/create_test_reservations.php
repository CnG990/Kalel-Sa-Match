<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

// Boot Laravel
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Terrain;
use App\Models\TerrainSynthetiquesDakar;
use App\Models\Reservation;

echo "🎫 CREATION DE RESERVATIONS DE TEST AVEC CODES AUTOMATIQUES...\n\n";

try {
    // Récupérer le client de test
    $client = User::where('email', 'client@test.com')->first();
    if (!$client) {
        echo "❌ Client de test non trouvé (client@test.com)\n";
        exit(1);
    }
    echo "✅ Client trouvé: {$client->email}\n";
    
    // Récupérer un terrain (essayer les deux tables)
    $terrain = TerrainSynthetiquesDakar::first();
    if (!$terrain) {
        $terrain = Terrain::first();
    }
    
    if (!$terrain) {
        echo "❌ Aucun terrain trouvé dans la base (ni dans terrains ni dans terrains_synthetiques_dakar)\n";
        
        // Afficher les counts pour debug
        echo "Debug - Terrain count: " . Terrain::count() . "\n";
        echo "Debug - TerrainSynthetiquesDakar count: " . TerrainSynthetiquesDakar::count() . "\n";
        exit(1);
    }
    echo "✅ Terrain trouvé: {$terrain->nom}\n\n";
    
    // Créer des réservations de test avec génération automatique de codes
    $reservations = [
        [
            'user_id' => $client->id,
            'terrain_id' => $terrain->id,
            'date_debut' => now()->addHours(2),
            'date_fin' => now()->addHours(4),
            'statut' => 'confirmee',
            'montant_total' => 50000,
            'notes' => 'Réservation test pour validation tickets'
        ],
        [
            'user_id' => $client->id,
            'terrain_id' => $terrain->id,
            'date_debut' => now()->addDays(1)->setHour(14),
            'date_fin' => now()->addDays(1)->setHour(16),
            'statut' => 'confirmee',
            'montant_total' => 50000,
            'notes' => 'Réservation test future'
        ],
        [
            'user_id' => $client->id,
            'terrain_id' => $terrain->id,
            'date_debut' => now()->subHours(1),
            'date_fin' => now()->addHours(1),
            'statut' => 'terminee',
            'montant_total' => 50000,
            'notes' => 'Réservation test terminée'
        ]
    ];
    
    echo "📋 CREATION DES RESERVATIONS :\n";
    foreach ($reservations as $index => $reservationData) {
        try {
            $reservation = Reservation::create($reservationData);
            echo "✅ Réservation " . ($index + 1) . " créée\n";
            echo "   Code ticket: {$reservation->code_ticket}\n";
            echo "   Statut: {$reservation->statut}\n";
            echo "   Date: " . $reservation->date_debut->format('d/m/Y H:i') . "\n\n";
        } catch (\Exception $e) {
            echo "❌ Erreur création réservation " . ($index + 1) . ": " . $e->getMessage() . "\n\n";
        }
    }
    
    // Afficher tous les codes de tickets disponibles
    $allTickets = Reservation::whereNotNull('code_ticket')
        ->orderBy('created_at', 'desc')
        ->get(['id', 'code_ticket', 'statut', 'date_debut']);
    
    echo "🎯 CODES DE TICKETS DISPONIBLES POUR TEST :\n";
    foreach ($allTickets as $ticket) {
        echo "- {$ticket->code_ticket} (ID: {$ticket->id}, Statut: {$ticket->statut})\n";
    }
    
    echo "\n✅ Réservations de test créées avec succès !\n";
    echo "💡 Vous pouvez maintenant tester la validation des tickets dans l'interface manager.\n";
    
} catch (\Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
} 