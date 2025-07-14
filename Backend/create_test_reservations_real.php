<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\TerrainSynthetiquesDakar;
use App\Models\User;
use Carbon\Carbon;

echo "🏟️ Création de réservations de test pour démontrer les statuts réels...\n\n";

try {
    // Récupérer quelques terrains
    $terrains = TerrainSynthetiquesDakar::take(5)->get();
    
    if ($terrains->isEmpty()) {
        echo "❌ Aucun terrain trouvé\n";
        exit(1);
    }
    
    // Utiliser un utilisateur existant ou créer une réservation sans utilisateur
    $user = User::first();
    
    if (!$user) {
        // Si aucun utilisateur, créer directement les réservations avec user_id = 1
        echo "👤 Aucun utilisateur trouvé, utilisation d'ID factice\n\n";
        $userId = 1;
    } else {
        echo "👤 Utilisateur existant: {$user->nom} {$user->prenom} (ID: {$user->id})\n\n";
        $userId = $user->id;
    }
    
    // Supprimer les anciennes réservations de test
    DB::table('reservations')->where('notes', 'LIKE', '%Réservation de test%')->delete();
    echo "🧹 Anciennes réservations de test supprimées\n\n";
    
    $reservationsCreated = 0;
    
    foreach ($terrains as $terrain) {
        // Créer 1-2 réservations par terrain avec différents statuts
        $nombreReservations = rand(0, 2);
        
        for ($i = 0; $i < $nombreReservations; $i++) {
            // Différents créneaux pour démonstration
            $scenarios = [
                // Réservation en cours (maintenant)
                [
                    'debut' => Carbon::now()->subMinutes(30),
                    'fin' => Carbon::now()->addHour(),
                    'statut' => 'confirmee',
                    'description' => 'En cours'
                ],
                // Réservation dans 1 heure
                [
                    'debut' => Carbon::now()->addHour(),
                    'fin' => Carbon::now()->addHours(2),
                    'statut' => 'confirmee',
                    'description' => 'Dans 1h'
                ],
                // Réservation en attente cet après-midi
                [
                    'debut' => Carbon::now()->addHours(3),
                    'fin' => Carbon::now()->addHours(4),
                    'statut' => 'en_attente',
                    'description' => 'Cet après-midi'
                ],
                // Réservation demain
                [
                    'debut' => Carbon::tomorrow()->setHour(14),
                    'fin' => Carbon::tomorrow()->setHour(16),
                    'statut' => 'confirmee',
                    'description' => 'Demain'
                ]
            ];
            
            $scenario = $scenarios[array_rand($scenarios)];
            
            // Calculer le montant
            $dureeHeures = $scenario['debut']->diffInHours($scenario['fin']);
            $montant = $dureeHeures * ($terrain->prix_heure ?? 5000);
            
            // Créer la réservation
            $reservation = DB::table('reservations')->insert([
                'terrain_synthetique_id' => $terrain->id,
                'user_id' => $userId,
                'date_debut' => $scenario['debut'],
                'date_fin' => $scenario['fin'],
                'montant_total' => $montant,
                'statut' => $scenario['statut'],
                'notes' => "Réservation de test - {$scenario['description']}",
                'code_ticket' => 'TSK-KSM-' . date('Y') . '-' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT),
                'acompte_verse' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            if ($reservation) {
                $reservationsCreated++;
                echo "✅ Réservation créée pour '{$terrain->nom}' - {$scenario['description']} ({$scenario['statut']})\n";
                echo "   📅 {$scenario['debut']->format('d/m/Y H:i')} → {$scenario['fin']->format('d/m/Y H:i')} ({$dureeHeures}h)\n";
                echo "   💰 {$montant} FCFA\n\n";
            }
        }
    }
    
    echo "\n🎉 Résumé:\n";
    echo "   {$reservationsCreated} réservations de test créées\n";
    echo "   {$terrains->count()} terrains avec des statuts variés\n\n";
    
    // Afficher l'état actuel
    echo "📊 État actuel des réservations:\n";
    $reservationsActuelles = DB::table('reservations')
        ->join('terrains_synthetiques_dakar', 'reservations.terrain_synthetique_id', '=', 'terrains_synthetiques_dakar.id')
        ->select('terrains_synthetiques_dakar.nom', 'reservations.date_debut', 'reservations.date_fin', 'reservations.statut')
        ->where('reservations.date_debut', '>=', Carbon::now()->subHours(1))
        ->where('reservations.date_debut', '<=', Carbon::now()->addHours(3))
        ->orderBy('reservations.date_debut')
        ->get();
    
    foreach ($reservationsActuelles as $res) {
        $debut = Carbon::parse($res->date_debut);
        $fin = Carbon::parse($res->date_fin);
        $statut = $res->statut;
        
        $statusEmoji = match($statut) {
            'confirmee' => '✅',
            'en_attente' => '⏳', 
            default => '❓'
        };
        
        echo "   {$statusEmoji} {$res->nom}: {$debut->format('H:i')} → {$fin->format('H:i')} ({$statut})\n";
    }
    
    echo "\n🗺️ Maintenant testez la carte - certains terrains devraient apparaître comme réservés !\n";
    echo "🌐 http://127.0.0.1:5174 (Frontend) + http://127.0.0.1:8000 (Backend)\n";
    
} catch (Exception $e) {
    echo "❌ Erreur: {$e->getMessage()}\n";
    echo "📋 Trace: {$e->getTraceAsString()}\n";
} 