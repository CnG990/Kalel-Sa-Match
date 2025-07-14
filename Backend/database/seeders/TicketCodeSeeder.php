<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Reservation;

class TicketCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Générer automatiquement des codes de tickets pour les réservations existantes qui n'en ont pas
        $reservations = Reservation::whereNull('code_ticket')->get();
        
        if ($reservations->isEmpty()) {
            $this->command->info("Toutes les réservations ont déjà des codes de tickets.");
            return;
        }
        
        $count = 0;
        foreach ($reservations as $reservation) {
            $ticketCode = $this->generateTicketCode($reservation->id);
            $reservation->update(['code_ticket' => $ticketCode]);
            $count++;
        }
        
        $this->command->info("✅ Codes de tickets générés automatiquement pour {$count} réservations.");
        
        // Afficher quelques exemples des codes générés
        $sampleTickets = Reservation::whereNotNull('code_ticket')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get(['id', 'code_ticket', 'statut']);
            
        if ($sampleTickets->isNotEmpty()) {
            $this->command->info("\n📋 Exemples de codes générés :");
            foreach ($sampleTickets as $reservation) {
                $this->command->info("  ID {$reservation->id}: {$reservation->code_ticket} ({$reservation->statut})");
            }
        }
    }
    
    /**
     * Générer un code de ticket unique au format TSK-KSM-ANNÉE-XXXXXX
     */
    private function generateTicketCode($reservationId)
    {
        $year = now()->year;
        $randomNumber = str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        $code = 'TSK-KSM-' . $year . '-' . $randomNumber;
        
        // S'assurer que le code est unique
        $counter = 1;
        while (Reservation::where('code_ticket', $code)->exists()) {
            $randomNumber = str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
            $code = 'TSK-KSM-' . $year . '-' . $randomNumber;
            $counter++;
            
            if ($counter > 10) break; // Éviter les boucles infinies
        }
        
        return $code;
    }
}
