<?php

namespace App\Services;

use App\Models\Reservation;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;

class QrCodeService
{
    /**
     * Générer un QR code pour une réservation
     */
    public function generateReservationQrCode(Reservation $reservation): array
    {
        try {
            // Générer un token unique pour cette réservation
            $token = Str::random(32);
            
            // Données à encoder dans le QR code
            $qrData = [
                'reservation_id' => $reservation->id,
                'token' => $token,
                'user_id' => $reservation->user_id,
                'terrain_id' => $reservation->terrain_id,
                'date_debut' => $reservation->date_debut,
                'created_at' => now()->toISOString()
            ];
            
            // Créer le contenu du QR code
            $qrContent = json_encode($qrData);
            
            // Générer le QR code
            $qrCode = QrCode::format('png')
                          ->size(300)
                          ->margin(2)
                          ->generate($qrContent);
            
            // Nom du fichier
            $fileName = 'qr_codes/reservation_' . $reservation->id . '_' . time() . '.png';
            
            // Sauvegarder le fichier
            Storage::disk('public')->put($fileName, $qrCode);
            
            // Mettre à jour la réservation avec les informations QR
            $reservation->update([
                'qr_code' => $token,
                'qr_code_path' => $fileName
            ]);
            
            return [
                'success' => true,
                'url' => Storage::url($fileName),
                'token' => $token,
                'path' => $fileName
            ];
            
        } catch (\Exception $e) {
            \Log::error('Erreur génération QR code: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Erreur lors de la génération du QR code',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Vérifier un QR code
     */
    public function verify(string $qrData): ?Reservation
    {
        try {
            // Essayer de décoder le JSON
            $data = json_decode($qrData, true);
            
            if (!$data || !isset($data['token']) || !isset($data['reservation_id'])) {
                // Si ce n'est pas du JSON, traiter comme un token simple
                $token = $qrData;
                $reservation = Reservation::where('qr_code', $token)->first();
            } else {
                // Si c'est du JSON, utiliser le token et l'ID
                $reservation = Reservation::where('id', $data['reservation_id'])
                                         ->where('qr_code', $data['token'])
                                         ->first();
            }
            
            if (!$reservation) {
                return null;
            }
            
            // Vérifier que la réservation est valide
            if ($reservation->statut !== 'confirmee') {
                return null;
            }
            
            // Vérifier que la réservation n'est pas expirée (pas plus de 24h après la fin)
            $dateExpiration = \Carbon\Carbon::parse($reservation->date_fin)->addHours(24);
            if (now()->gt($dateExpiration)) {
                return null;
            }
            
            return $reservation;
            
        } catch (\Exception $e) {
            \Log::error('Erreur vérification QR code: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Vérifier un QR code avec validation complète
     */
    public function verifyQrCode(string $token, int $reservationId): array
    {
        try {
            $reservation = Reservation::with(['user', 'terrain'])
                                     ->where('id', $reservationId)
                                     ->where('qr_code', $token)
                                     ->first();

            if (!$reservation) {
                return [
                    'valid' => false,
                    'message' => 'QR code invalide ou réservation introuvable'
                ];
            }

            // Vérifications supplémentaires
            $now = now();
            $dateDebut = \Carbon\Carbon::parse($reservation->date_debut);
            $dateFin = \Carbon\Carbon::parse($reservation->date_fin);

            // Vérifier que c'est le bon jour (pas plus de 2h avant ou après)
            if ($now->lt($dateDebut->subHours(2)) || $now->gt($dateFin->addHours(2))) {
                return [
                    'valid' => false,
                    'message' => 'QR code valide mais hors de la période autorisée'
                ];
            }

            // Vérifier le statut
            if ($reservation->statut !== 'confirmee') {
                return [
                    'valid' => false,
                    'message' => 'Réservation non confirmée'
                ];
            }

            return [
                'valid' => true,
                'message' => 'QR code valide',
                'reservation' => $reservation
            ];

        } catch (\Exception $e) {
            \Log::error('Erreur vérification QR code: ' . $e->getMessage());
            
            return [
                'valid' => false,
                'message' => 'Erreur lors de la vérification',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Générer un QR code simple avec du texte
     */
    public function generateSimpleQrCode(string $content, string $fileName = null): string
    {
        if (!$fileName) {
            $fileName = 'qr_codes/simple_' . time() . '.png';
        }

        $qrCode = QrCode::format('png')
                      ->size(200)
                      ->margin(1)
                      ->generate($content);

        Storage::disk('public')->put($fileName, $qrCode);

        return Storage::url($fileName);
    }

    /**
     * Supprimer un QR code
     */
    public function deleteQrCode(string $path): bool
    {
        try {
            if (Storage::disk('public')->exists($path)) {
                return Storage::disk('public')->delete($path);
            }
            return true;
        } catch (\Exception $e) {
            \Log::error('Erreur suppression QR code: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Régénérer un QR code pour une réservation existante
     */
    public function regenerateReservationQrCode(Reservation $reservation): array
    {
        // Supprimer l'ancien QR code s'il existe
        if ($reservation->qr_code_path) {
            $this->deleteQrCode($reservation->qr_code_path);
        }

        // Générer un nouveau QR code
        return $this->generateReservationQrCode($reservation);
    }

    /**
     * Obtenir les statistiques des QR codes
     */
    public function getQrCodeStats(): array
    {
        $totalReservations = Reservation::count();
        $reservationsAvecQr = Reservation::whereNotNull('qr_code')->count();
        $qrCodesUtilises = Reservation::whereNotNull('qr_code')
                                    ->where('statut', 'terminee')
                                    ->count();

        return [
            'total_reservations' => $totalReservations,
            'qr_codes_generes' => $reservationsAvecQr,
            'qr_codes_utilises' => $qrCodesUtilises,
            'taux_utilisation' => $reservationsAvecQr > 0 ? 
                round(($qrCodesUtilises / $reservationsAvecQr) * 100, 2) : 0
        ];
    }
} 