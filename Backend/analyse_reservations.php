<?php

require_once 'vendor/autoload.php';

use App\Models\Reservation;
use App\Models\TerrainSynthetiquesDakar;
use Illuminate\Support\Facades\DB;

// Initialiser Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== ANALYSE DES RÉSERVATIONS PAR HEURE ===\n\n";

// 1. Statistiques générales des réservations
echo "1. STATISTIQUES GÉNÉRALES :\n";
echo "----------------------------\n";

$totalReservations = Reservation::count();
echo "Total des réservations : " . $totalReservations . "\n";

$reservationsParTerrain = Reservation::select('terrain_synthetique_id', DB::raw('COUNT(*) as total'))
    ->groupBy('terrain_synthetique_id')
    ->get();

echo "\nRéservations par terrain :\n";
foreach ($reservationsParTerrain as $reservation) {
    $terrain = TerrainSynthetiquesDakar::find($reservation->terrain_synthetique_id);
    if ($terrain) {
        echo "- " . $terrain->nom . " : " . $reservation->total . " réservations\n";
    }
}

// 2. Analyse par heure (utiliser date_debut au lieu de date_reservation)
echo "\n2. ANALYSE PAR HEURE :\n";
echo "----------------------\n";

$reservationsParHeure = Reservation::select(
    DB::raw('EXTRACT(HOUR FROM date_debut) as heure'),
    DB::raw('COUNT(*) as total')
)
->groupBy('heure')
->orderBy('heure')
->get();

echo "Répartition des réservations par heure :\n";
foreach ($reservationsParHeure as $stat) {
    echo "- " . $stat->heure . "h : " . $stat->total . " réservations\n";
}

// 3. Heures de pointe
echo "\n3. HEURES DE POINTE :\n";
echo "---------------------\n";

$heuresPointe = $reservationsParHeure->sortByDesc('total')->take(3);
echo "Top 3 des heures les plus demandées :\n";
foreach ($heuresPointe as $index => $stat) {
    echo ($index + 1) . ". " . $stat->heure . "h : " . $stat->total . " réservations\n";
}

// 4. Analyse par jour de la semaine (utiliser date_debut)
echo "\n4. ANALYSE PAR JOUR DE LA SEMAINE :\n";
echo "-----------------------------------\n";

$reservationsParJour = Reservation::select(
    DB::raw('EXTRACT(DOW FROM date_debut) as jour'),
    DB::raw('COUNT(*) as total')
)
->groupBy('jour')
->orderBy('jour')
->get();

$jours = [
    0 => 'Dimanche',
    1 => 'Lundi', 
    2 => 'Mardi',
    3 => 'Mercredi',
    4 => 'Jeudi',
    5 => 'Vendredi',
    6 => 'Samedi'
];

foreach ($reservationsParJour as $stat) {
    $jourNom = $jours[$stat->jour] ?? 'Inconnu';
    echo "- " . $jourNom . " : " . $stat->total . " réservations\n";
}

// 5. Revenus estimés par terrain
echo "\n5. REVENUS ESTIMÉS PAR TERRAIN :\n";
echo "--------------------------------\n";

$revenusParTerrain = Reservation::join('terrains_synthetiques_dakar', 'reservations.terrain_synthetique_id', '=', 'terrains_synthetiques_dakar.id')
    ->select(
        'terrains_synthetiques_dakar.nom',
        'terrains_synthetiques_dakar.prix_heure',
        DB::raw('COUNT(*) as nombre_reservations'),
        DB::raw('COUNT(*) * terrains_synthetiques_dakar.prix_heure as revenus_estimes')
    )
    ->groupBy('terrains_synthetiques_dakar.id', 'terrains_synthetiques_dakar.nom', 'terrains_synthetiques_dakar.prix_heure')
    ->get();

foreach ($revenusParTerrain as $revenu) {
    echo "- " . $revenu->nom . " :\n";
    echo "  * " . $revenu->nombre_reservations . " réservations\n";
    echo "  * Prix/heure : " . number_format($revenu->prix_heure, 0, ',', ' ') . " FCFA\n";
    echo "  * Revenus estimés : " . number_format($revenu->revenus_estimes, 0, ',', ' ') . " FCFA\n\n";
}

// 6. Taux d'occupation par terrain
echo "6. TAUX D'OCCUPATION PAR TERRAIN :\n";
echo "---------------------------------\n";

$terrains = TerrainSynthetiquesDakar::all();
foreach ($terrains as $terrain) {
    $reservations = Reservation::where('terrain_synthetique_id', $terrain->id)->count();
    $tauxOccupation = $totalReservations > 0 ? ($reservations / $totalReservations) * 100 : 0;
    
    echo "- " . $terrain->nom . " : " . number_format($tauxOccupation, 1) . "% d'occupation (" . $reservations . " réservations)\n";
}

// 7. Analyse des statuts de réservation
echo "\n7. ANALYSE DES STATUTS DE RÉSERVATION :\n";
echo "----------------------------------------\n";

$statutsReservation = Reservation::select('statut', DB::raw('COUNT(*) as total'))
    ->groupBy('statut')
    ->get();

foreach ($statutsReservation as $statut) {
    echo "- " . ucfirst($statut->statut) . " : " . $statut->total . " réservations\n";
}

// 8. Durée moyenne des réservations
echo "\n8. DURÉE MOYENNE DES RÉSERVATIONS :\n";
echo "------------------------------------\n";

$dureeMoyenne = Reservation::select(
    DB::raw('AVG(EXTRACT(EPOCH FROM (date_fin - date_debut))/3600) as duree_moyenne_heures')
)->first();

echo "Durée moyenne : " . number_format($dureeMoyenne->duree_moyenne_heures, 1) . " heures\n";

echo "\n=== FIN DE L'ANALYSE ===\n"; 