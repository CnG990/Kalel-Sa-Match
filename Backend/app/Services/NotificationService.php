<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Services\SmsService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;

class NotificationService
{
    /**
     * Envoyer une notification à un utilisateur
     */
    public function send(User $user, string $type, array $data, array $options = []): bool
    {
        try {
            $priority = $options['priority'] ?? 'normal';
            $channels = $options['channels'] ?? ['database'];
            $sendAt = $options['send_at'] ?? null;

            // Créer la notification en base
            $notification = Notification::createForUser($user, $type, $data, $priority);
            
            if ($sendAt) {
                $notification->update(['send_at' => $sendAt]);
                return true; // Sera envoyée plus tard
            }

            // Envoyer sur tous les canaux demandés
            foreach ($channels as $channel) {
                $this->sendToChannel($notification, $channel);
            }

            $notification->update(['sent' => true]);
            return true;

        } catch (\Exception $e) {
            Log::error('Erreur envoi notification', [
                'user_id' => $user->id,
                'type' => $type,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Envoyer notification sur un canal spécifique
     */
    private function sendToChannel(Notification $notification, string $channel): void
    {
        switch ($channel) {
            case 'email':
                $this->sendEmail($notification);
                break;
            case 'sms':
                $this->sendSMS($notification);
                break;
            case 'push':
                $this->sendPush($notification);
                break;
            case 'websocket':
                $this->sendWebSocket($notification);
                break;
            case 'database':
                // Déjà sauvegardé
                break;
        }
    }

    /**
     * Envoyer notification par email
     */
    private function sendEmail(Notification $notification): void
    {
        $user = $notification->notifiable;
        $data = $notification->data;

        Mail::send('emails.notification', [
            'user' => $user,
            'notification' => $notification,
            'data' => $data
        ], function ($message) use ($user, $notification) {
            $message->to($user->email)
                   ->subject($this->getSubject($notification->type));
        });
    }

    /**
     * Envoyer notification par SMS
     */
    private function sendSMS(Notification $notification): void
    {
        $user = $notification->notifiable;
        
        if (!$user->telephone) {
            Log::warning('Impossible d\'envoyer SMS: téléphone manquant', [
                'user_id' => $user->id,
                'notification_id' => $notification->id
            ]);
            return;
        }

        try {
            $smsService = app(SmsService::class);
            $message = $this->getSMSText($notification);
            
            $result = $smsService->send($user->telephone, $message);
            
            if (!$result['success']) {
                Log::error('Échec envoi SMS notification', [
                    'user_id' => $user->id,
                    'notification_id' => $notification->id,
                    'error' => $result['message'] ?? 'Erreur inconnue'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception lors de l\'envoi SMS notification', [
                'user_id' => $user->id,
                'notification_id' => $notification->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Envoyer notification push
     */
    private function sendPush(Notification $notification): void
    {
        // Intégration Firebase Cloud Messaging ou service similaire
        $fcmToken = $notification->notifiable->fcm_token;
        
        if ($fcmToken) {
            Http::withHeaders([
                'Authorization' => 'key=' . config('services.fcm.server_key'),
                'Content-Type' => 'application/json'
            ])->post('https://fcm.googleapis.com/fcm/send', [
                'to' => $fcmToken,
                'notification' => [
                    'title' => $this->getSubject($notification->type),
                    'body' => $this->getPushText($notification),
                    'icon' => '/logo.png'
                ],
                'data' => $notification->data
            ]);
        }
    }

    /**
     * Envoyer notification via WebSocket
     */
    private function sendWebSocket(Notification $notification): void
    {
        // Intégration Pusher ou WebSocket custom
        broadcast(new \App\Events\NotificationSent($notification));
    }

    /**
     * Traiter les notifications programmées
     */
    public function processScheduledNotifications(): void
    {
        $notifications = Notification::pending()->get();

        foreach ($notifications as $notification) {
            $this->sendToChannel($notification, $notification->channel);
            $notification->update(['sent' => true]);
        }
    }

    /**
     * Notifications spécifiques par type
     */
    public function reservationConfirmed(User $user, $reservation): bool
    {
        return $this->send($user, Notification::TYPES['RESERVATION_CONFIRMED'], [
            'reservation_id' => $reservation->id,
            'terrain_name' => $reservation->terrain->nom,
            'date' => $reservation->date_debut->format('d/m/Y H:i'),
            'message' => 'Votre réservation a été confirmée!'
        ], ['channels' => ['database', 'email', 'push']]);
    }

    public function upcomingMatchReminder(User $user, $reservation): bool
    {
        return $this->send($user, Notification::TYPES['REMINDER_UPCOMING_MATCH'], [
            'reservation_id' => $reservation->id,
            'terrain_name' => $reservation->terrain->nom,
            'time_until' => $reservation->date_debut->diffForHumans(),
            'message' => 'N\'oubliez pas votre match dans ' . $reservation->date_debut->diffForHumans()
        ], [
            'channels' => ['database', 'push', 'sms'],
            'send_at' => $reservation->date_debut->subHours(2)
        ]);
    }

    public function paymentReceived(User $user, $payment): bool
    {
        return $this->send($user, Notification::TYPES['PAYMENT_RECEIVED'], [
            'payment_id' => $payment->id,
            'amount' => $payment->montant,
            'method' => $payment->methode,
            'message' => 'Paiement de ' . number_format($payment->montant) . ' FCFA reçu'
        ], ['channels' => ['database', 'email']]);
    }

    /**
     * Obtenir le sujet d'email selon le type
     */
    private function getSubject(string $type): string
    {
        $subjects = [
            'reservation_confirmed' => 'Réservation confirmée - Terrains Synthétiques',
            'payment_received' => 'Paiement reçu - Terrains Synthétiques',
            'reminder_upcoming_match' => 'Rappel : Votre match approche',
            'manager_approved' => 'Félicitations ! Votre compte gestionnaire est approuvé',
        ];

        return $subjects[$type] ?? 'Notification - Terrains Synthétiques';
    }

    /**
     * Obtenir le texte SMS selon le type
     */
    private function getSMSText(Notification $notification): string
    {
        $data = $notification->data;
        
        switch ($notification->type) {
            case 'reminder_upcoming_match':
                return "Rappel: Votre match au {$data['terrain_name']} dans {$data['time_until']}. Bon jeu!";
            default:
                return $data['message'] ?? 'Nouvelle notification';
        }
    }

    /**
     * Obtenir le texte push selon le type
     */
    private function getPushText(Notification $notification): string
    {
        return $notification->data['message'] ?? 'Vous avez une nouvelle notification';
    }
} 