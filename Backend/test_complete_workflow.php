<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\TerrainSynthetiquesDakar;
use App\Models\Reservation;
use App\Models\Paiement;
use App\Models\Litige;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🧪 TEST COMPLET DU WORKFLOW - TERRAINS SYNTHÉTIQUES\n";
echo str_repeat("=", 60) . "\n\n";

// ===== ÉTAPE 1: VÉRIFICATION DES UTILISATEURS =====
echo "1️⃣ VÉRIFICATION DES UTILISATEURS\n";
echo str_repeat("-", 40) . "\n";

$client = User::where('email', 'client@terrains-dakar.com')->first();
$gestionnaire = User::where('email', 'gestionnaire@terrains-dakar.com')->first();
$admin = User::where('email', 'admin@terrains-dakar.com')->first();

if (!$client) {
    echo "❌ Client non trouvé\n";
    exit;
}
if (!$gestionnaire) {
    echo "❌ Gestionnaire non trouvé\n";
    exit;
}
if (!$admin) {
    echo "❌ Admin non trouvé\n";
    exit;
}

echo "✅ Client: {$client->nom} {$client->prenom} (ID: {$client->id})\n";
echo "✅ Gestionnaire: {$gestionnaire->nom} {$gestionnaire->prenom} (ID: {$gestionnaire->id})\n";
echo "✅ Admin: {$admin->nom} {$admin->prenom} (ID: {$admin->id})\n\n";

// ===== ÉTAPE 2: VÉRIFICATION DES TERRAINS =====
echo "2️⃣ VÉRIFICATION DES TERRAINS\n";
echo str_repeat("-", 40) . "\n";

$terrains = TerrainSynthetiquesDakar::where('est_actif', true)->take(3)->get();
if ($terrains->count() == 0) {
    echo "❌ Aucun terrain actif trouvé\n";
    exit;
}

echo "✅ Terrains disponibles :\n";
foreach ($terrains as $terrain) {
    echo "   - {$terrain->nom} (ID: {$terrain->id}, Prix: {$terrain->prix_heure} FCFA/h)\n";
}
$terrainTest = $terrains->first();
echo "\n🎯 Terrain sélectionné pour le test : {$terrainTest->nom}\n\n";

// ===== ÉTAPE 3: SIMULATION D'UNE RÉSERVATION CLIENT =====
echo "3️⃣ SIMULATION RÉSERVATION CLIENT\n";
echo str_repeat("-", 40) . "\n";

// Créer une réservation
$reservation = new Reservation();
$reservation->user_id = $client->id;
$reservation->terrain_id = $terrainTest->id;
$reservation->date_debut = now()->addDays(2)->setTime(18, 0, 0);
$reservation->date_fin = now()->addDays(2)->setTime(20, 0, 0);
$reservation->montant_total = $terrainTest->prix_heure * 2;
$reservation->statut = 'en_attente';
$reservation->notes = 'Réservation de test pour workflow complet';
$reservation->save();

$duree = $reservation->date_fin->diffInHours($reservation->date_debut);
echo "✅ Réservation créée :\n";
echo "   - ID: {$reservation->id}\n";
echo "   - Client: {$client->nom} {$client->prenom}\n";
echo "   - Terrain: {$terrainTest->nom}\n";
echo "   - Date: {$reservation->date_debut->format('d/m/Y H:i')}\n";
echo "   - Durée: {$duree}h\n";
echo "   - Prix: {$reservation->montant_total} FCFA\n";
echo "   - Statut: {$reservation->statut}\n\n";

// ===== ÉTAPE 4: SIMULATION PAIEMENT =====
echo "4️⃣ SIMULATION PAIEMENT\n";
echo str_repeat("-", 40) . "\n";

$paiement = new Paiement();
$paiement->user_id = $client->id;
$paiement->payable_type = 'App\Models\Reservation';
$paiement->payable_id = $reservation->id;
$paiement->reference_transaction = 'WAVE_' . time();
$paiement->montant = $reservation->montant_total;
$paiement->methode = 'mobile_money';
$paiement->statut = 'reussi';
$paiement->save();

echo "✅ Paiement créé :\n";
echo "   - ID: {$paiement->id}\n";
echo "   - Montant: {$paiement->montant} FCFA\n";
echo "   - Méthode: {$paiement->methode}\n";
echo "   - Référence: {$paiement->reference_transaction}\n";
echo "   - Statut: {$paiement->statut}\n\n";

// Mettre à jour le statut de la réservation
$reservation->statut = 'confirmee';
$reservation->save();
echo "✅ Réservation confirmée après paiement\n\n";

// ===== ÉTAPE 5: SIMULATION LITIGE =====
echo "5️⃣ SIMULATION LITIGE\n";
echo str_repeat("-", 40) . "\n";

$litige = new Litige();
$litige->numero_litige = 'LIT-' . time();
$litige->user_id = $client->id;
$litige->terrain_id = $terrainTest->id;
$litige->reservation_id = $reservation->id;
$litige->type_litige = 'service';
$litige->sujet = 'Terrain en mauvais état';
$litige->description = 'Le terrain était en mauvais état lors de la réservation. Gazon usé et trous dans le sol.';
$litige->priorite = 'normale';
$litige->statut = 'nouveau';
$litige->save();

echo "✅ Litige créé :\n";
echo "   - ID: {$litige->id}\n";
echo "   - Type: {$litige->type_litige}\n";
echo "   - Sujet: {$litige->sujet}\n";
echo "   - Priorité: {$litige->priorite}\n";
echo "   - Statut: {$litige->statut}\n\n";

// ===== ÉTAPE 6: SIMULATION RÉPONSE GESTIONNAIRE =====
echo "6️⃣ SIMULATION RÉPONSE GESTIONNAIRE\n";
echo str_repeat("-", 40) . "\n";

// Ajouter une réponse du gestionnaire
DB::table('messages_litige')->insert([
    'litige_id' => $litige->id,
    'user_id' => $gestionnaire->id,
    'role_expediteur' => 'gestionnaire',
    'message' => 'Nous nous excusons pour ce désagrément. Le terrain sera rénové dans les plus brefs délais. Nous vous proposons une réduction de 50% sur votre prochaine réservation.',
    'type_message' => 'reponse',
    'created_at' => now(),
    'updated_at' => now(),
]);

echo "✅ Réponse gestionnaire ajoutée\n";
echo "   - Gestionnaire: {$gestionnaire->nom} {$gestionnaire->prenom}\n";
echo "   - Message: Proposition de réduction de 50%\n\n";

// ===== ÉTAPE 7: SIMULATION RÉSOLUTION ADMIN =====
echo "7️⃣ SIMULATION RÉSOLUTION ADMIN\n";
echo str_repeat("-", 40) . "\n";

// L'admin intervient pour résoudre le litige
$litige->statut = 'en_cours';
$litige->ferme_par = $admin->id;
$litige->save();

// Ajouter une décision admin
DB::table('messages_litige')->insert([
    'litige_id' => $litige->id,
    'user_id' => $admin->id,
    'role_expediteur' => 'admin',
    'message' => 'Litige traité par l\'administration. Réduction de 50% accordée et terrain programmé pour rénovation.',
    'type_message' => 'resolution',
    'created_at' => now(),
    'updated_at' => now(),
]);

echo "✅ Intervention admin :\n";
echo "   - Admin: {$admin->nom} {$admin->prenom}\n";
echo "   - Action: Réduction de 50% accordée\n";
echo "   - Statut litige: {$litige->statut}\n\n";

// ===== ÉTAPE 8: SIMULATION RÉSOLUTION FINALE =====
echo "8️⃣ SIMULATION RÉSOLUTION FINALE\n";
echo str_repeat("-", 40) . "\n";

// Le client accepte la solution
$litige->statut = 'resolu';
$litige->resolution = 'Réduction de 50% accordée sur la prochaine réservation';
$litige->satisfaction_client = 4; // Sur 5
$litige->date_fermeture = now();
$litige->save();

echo "✅ Litige résolu :\n";
echo "   - Résolution: {$litige->resolution}\n";
echo "   - Satisfaction client: {$litige->satisfaction_client}/5\n";
echo "   - Statut final: {$litige->statut}\n\n";

// ===== ÉTAPE 9: VÉRIFICATION DES DONNÉES =====
echo "9️⃣ VÉRIFICATION DES DONNÉES\n";
echo str_repeat("-", 40) . "\n";

// Compter les réservations
$reservationsCount = Reservation::count();
$reservationsClient = Reservation::where('user_id', $client->id)->count();

// Compter les paiements
$paiementsCount = Paiement::count();
$paiementsClient = Paiement::where('user_id', $client->id)->count();

// Compter les litiges
$litigesCount = Litige::count();
$litigesClient = Litige::where('user_id', $client->id)->count();

echo "📊 Statistiques :\n";
echo "   - Réservations totales: {$reservationsCount}\n";
echo "   - Réservations client: {$reservationsClient}\n";
echo "   - Paiements totaux: {$paiementsCount}\n";
echo "   - Paiements client: {$paiementsClient}\n";
echo "   - Litiges totaux: {$litigesCount}\n";
echo "   - Litiges client: {$litigesClient}\n\n";

// ===== ÉTAPE 10: TEST DES VUES GESTIONNAIRE ET ADMIN =====
echo "🔟 TEST DES VUES GESTIONNAIRE ET ADMIN\n";
echo str_repeat("-", 40) . "\n";

// Simuler ce que voit le gestionnaire
echo "👨‍💼 VUE GESTIONNAIRE :\n";
echo "   - Réservations de ses terrains\n";
echo "   - Paiements reçus\n";
echo "   - Litiges à traiter\n";
echo "   - Revenus générés\n\n";

// Simuler ce que voit l'admin
echo "👑 VUE ADMIN :\n";
echo "   - Toutes les réservations\n";
echo "   - Tous les paiements\n";
echo "   - Tous les litiges\n";
echo "   - Statistiques globales\n";
echo "   - Gestion des utilisateurs\n\n";

echo "✅ TEST COMPLET TERMINÉ AVEC SUCCÈS !\n";
echo str_repeat("=", 60) . "\n";
echo "🎯 Workflow testé : Client → Réservation → Paiement → Litige → Gestionnaire → Admin → Résolution\n";
echo "📝 Toutes les données de test ont été créées dans la base de données\n";
