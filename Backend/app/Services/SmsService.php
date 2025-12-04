<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Exception;

class SmsService
{
    /**
     * Fournisseur SMS configuré
     */
    protected string $provider;

    /**
     * Configuration du fournisseur
     */
    protected array $config;

    /**
     * Constructeur
     */
    public function __construct()
    {
        $this->provider = config('services.sms.provider', 'africas_talking');
        $this->config = config("services.sms.providers.{$this->provider}", []);
    }

    /**
     * Envoyer un SMS
     *
     * @param string $to Numéro de téléphone destinataire (format international: +221XXXXXXXXX)
     * @param string $message Message à envoyer
     * @param array $options Options supplémentaires (sender, etc.)
     * @return array Résultat de l'envoi
     */
    public function send(string $to, string $message, array $options = []): array
    {
        try {
            // Normaliser le numéro de téléphone
            $to = $this->normalizePhoneNumber($to);

            // Vérifier que le fournisseur est configuré
            if (empty($this->config)) {
                Log::warning('SMS Provider non configuré', [
                    'provider' => $this->provider,
                    'to' => $to
                ]);
                return $this->handleFailure('SMS Provider non configuré');
            }

            // Envoyer selon le fournisseur
            return match ($this->provider) {
                'africas_talking' => $this->sendViaAfricasTalking($to, $message, $options),
                'twilio' => $this->sendViaTwilio($to, $message, $options),
                'orange' => $this->sendViaOrange($to, $message, $options),
                'messagebird' => $this->sendViaMessageBird($to, $message, $options),
                'ovh' => $this->sendViaOvh($to, $message, $options),
                'log' => $this->sendViaLog($to, $message, $options), // Pour développement
                default => $this->handleFailure("Fournisseur SMS non supporté: {$this->provider}")
            };

        } catch (Exception $e) {
            Log::error('Erreur envoi SMS', [
                'provider' => $this->provider,
                'to' => $to,
                'error' => $e->getMessage()
            ]);

            return $this->handleFailure($e->getMessage());
        }
    }

    /**
     * Envoyer un code OTP
     *
     * @param string $to Numéro de téléphone
     * @param string $code Code OTP (6 chiffres)
     * @param string|null $appName Nom de l'application (optionnel)
     * @return array
     */
    public function sendOTP(string $to, string $code, ?string $appName = null): array
    {
        $appName = $appName ?? config('app.name', 'KSM');
        $message = "Votre code de vérification {$appName}: {$code}. Valide 10 minutes. Ne partagez jamais ce code.";

        return $this->send($to, $message);
    }

    /**
     * Envoyer un SMS de bienvenue après inscription
     *
     * @param string $to Numéro de téléphone
     * @param string $nom Nom de l'utilisateur
     * @param string|null $appName Nom de l'application
     * @return array
     */
    public function sendWelcomeMessage(string $to, string $nom, ?string $appName = null): array
    {
        $appName = $appName ?? config('app.name', 'KSM');
        $message = "Bienvenue {$nom} sur {$appName}! Votre compte a été créé avec succès. Profitez de nos services.";

        return $this->send($to, $message);
    }

    /**
     * Envoyer un SMS de confirmation de réservation
     *
     * @param string $to Numéro de téléphone
     * @param array $reservationData Données de la réservation
     * @return array
     */
    public function sendReservationConfirmation(string $to, array $reservationData): array
    {
        $terrain = $reservationData['terrain_name'] ?? 'terrain';
        $date = $reservationData['date'] ?? 'date non spécifiée';
        $message = "Réservation confirmée! Terrain: {$terrain}, Date: {$date}. À bientôt!";

        return $this->send($to, $message);
    }

    /**
     * Envoyer via Africa's Talking
     */
    protected function sendViaAfricasTalking(string $to, string $message, array $options = []): array
    {
        try {
            $username = $this->config['username'] ?? null;
            $apiKey = $this->config['api_key'] ?? null;
            $senderId = $options['sender'] ?? $this->config['sender_id'] ?? null;

            if (!$username || !$apiKey) {
                return $this->handleFailure('Africa\'s Talking credentials manquantes');
            }

            // Utiliser le SDK Africa's Talking si disponible, sinon HTTP
            if (class_exists(\AfricasTalking\SDK\AfricasTalking::class)) {
                $AT = new \AfricasTalking\SDK\AfricasTalking($username, $apiKey);
                $sms = $AT->sms();
                
                $result = $sms->send([
                    'to' => $to,
                    'message' => $message,
                    'from' => $senderId
                ]);

                if (isset($result['status']) && $result['status'] === 'success') {
                    Log::info('SMS envoyé via Africa\'s Talking', ['to' => $to]);
                    return $this->handleSuccess($result);
                }

                return $this->handleFailure($result['message'] ?? 'Erreur inconnue');
            }

            // Fallback: utiliser l'API HTTP directement
            $response = Http::withHeaders([
                'apiKey' => $apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->post("https://api.africastalking.com/version1/messaging", [
                'username' => $username,
                'to' => $to,
                'message' => $message,
                'from' => $senderId
            ]);

            if ($response->successful()) {
                Log::info('SMS envoyé via Africa\'s Talking (HTTP)', ['to' => $to]);
                return $this->handleSuccess($response->json());
            }

            return $this->handleFailure($response->body());

        } catch (Exception $e) {
            return $this->handleFailure($e->getMessage());
        }
    }

    /**
     * Envoyer via Twilio
     */
    protected function sendViaTwilio(string $to, string $message, array $options = []): array
    {
        try {
            $accountSid = $this->config['account_sid'] ?? null;
            $authToken = $this->config['auth_token'] ?? null;
            $from = $options['sender'] ?? $this->config['from'] ?? null;

            if (!$accountSid || !$authToken || !$from) {
                return $this->handleFailure('Twilio credentials manquantes');
            }

            // Utiliser le SDK Twilio si disponible
            if (class_exists(\Twilio\Rest\Client::class)) {
                $client = new \Twilio\Rest\Client($accountSid, $authToken);
                
                $result = $client->messages->create($to, [
                    'from' => $from,
                    'body' => $message
                ]);

                Log::info('SMS envoyé via Twilio', ['to' => $to, 'sid' => $result->sid]);
                return $this->handleSuccess(['sid' => $result->sid, 'status' => $result->status]);
            }

            // Fallback: utiliser l'API HTTP directement
            $response = Http::withBasicAuth($accountSid, $authToken)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json", [
                    'From' => $from,
                    'To' => $to,
                    'Body' => $message
                ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('SMS envoyé via Twilio (HTTP)', ['to' => $to, 'sid' => $data['sid'] ?? null]);
                return $this->handleSuccess($data);
            }

            return $this->handleFailure($response->body());

        } catch (Exception $e) {
            return $this->handleFailure($e->getMessage());
        }
    }

    /**
     * Envoyer via Orange SMS API
     */
    protected function sendViaOrange(string $to, string $message, array $options = []): array
    {
        try {
            $clientId = $this->config['client_id'] ?? null;
            $clientSecret = $this->config['client_secret'] ?? null;
            $senderAddress = $options['sender'] ?? $this->config['sender_address'] ?? '+221123456789';

            if (!$clientId || !$clientSecret) {
                return $this->handleFailure('Orange credentials manquantes');
            }

            // Obtenir le token d'accès
            $tokenResponse = Http::asForm()->post('https://api.orange.com/oauth/v2/token', [
                'grant_type' => 'client_credentials'
            ])->withBasicAuth($clientId, $clientSecret);

            if (!$tokenResponse->successful()) {
                return $this->handleFailure('Impossible d\'obtenir le token Orange');
            }

            $accessToken = $tokenResponse->json()['access_token'] ?? null;

            if (!$accessToken) {
                return $this->handleFailure('Token d\'accès Orange invalide');
            }

            // Envoyer le SMS
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json'
            ])->post('https://api.orange.com/smsmessaging/v1/outbound/' . urlencode($senderAddress) . '/requests', [
                'outboundSMSMessageRequest' => [
                    'address' => 'tel:' . $to,
                    'senderAddress' => 'tel:' . $senderAddress,
                    'outboundSMSTextMessage' => [
                        'message' => $message
                    ]
                ]
            ]);

            if ($response->successful()) {
                Log::info('SMS envoyé via Orange', ['to' => $to]);
                return $this->handleSuccess($response->json());
            }

            return $this->handleFailure($response->body());

        } catch (Exception $e) {
            return $this->handleFailure($e->getMessage());
        }
    }

    /**
     * Envoyer via MessageBird
     */
    protected function sendViaMessageBird(string $to, string $message, array $options = []): array
    {
        try {
            $apiKey = $this->config['api_key'] ?? null;
            $originator = $options['sender'] ?? $this->config['originator'] ?? null;

            if (!$apiKey || !$originator) {
                return $this->handleFailure('MessageBird credentials manquantes');
            }

            $response = Http::withHeaders([
                'Authorization' => 'AccessKey ' . $apiKey,
                'Content-Type' => 'application/json'
            ])->post('https://rest.messagebird.com/messages', [
                'originator' => $originator,
                'recipients' => [$to],
                'body' => $message
            ]);

            if ($response->successful()) {
                Log::info('SMS envoyé via MessageBird', ['to' => $to]);
                return $this->handleSuccess($response->json());
            }

            return $this->handleFailure($response->body());

        } catch (Exception $e) {
            return $this->handleFailure($e->getMessage());
        }
    }

    /**
     * Envoyer via OVH SMS
     */
    protected function sendViaOvh(string $to, string $message, array $options = []): array
    {
        try {
            $account = $this->config['account'] ?? null;
            $login = $this->config['login'] ?? null;
            $password = $this->config['password'] ?? null;
            $sender = $options['sender'] ?? $this->config['sender'] ?? null;

            if (!$account || !$login || !$password) {
                return $this->handleFailure('OVH SMS credentials manquantes');
            }

            // OVH SMS API utilise une authentification basique
            // Format: https://www.ovh.com/cgi-bin/sms/http2sms.cgi
            $response = Http::asForm()->post('https://www.ovh.com/cgi-bin/sms/http2sms.cgi', [
                'account' => $account,
                'login' => $login,
                'password' => $password,
                'from' => $sender,
                'to' => $to,
                'message' => $message,
                'noStop' => '1' // Ne pas ajouter "STOP" au message
            ]);

            if ($response->successful()) {
                $body = $response->body();
                
                // OVH retourne "OK" en cas de succès ou un code d'erreur
                if (str_contains($body, 'OK') || str_contains($body, 'id:')) {
                    Log::info('SMS envoyé via OVH', ['to' => $to]);
                    return $this->handleSuccess(['status' => 'sent', 'response' => $body]);
                }

                return $this->handleFailure('Erreur OVH: ' . $body);
            }

            return $this->handleFailure('Erreur HTTP OVH: ' . $response->status());

        } catch (Exception $e) {
            return $this->handleFailure($e->getMessage());
        }
    }

    /**
     * Envoyer via Log (pour développement/test)
     */
    protected function sendViaLog(string $to, string $message, array $options = []): array
    {
        Log::info('SMS (Mode Log)', [
            'to' => $to,
            'message' => $message,
            'provider' => $this->provider
        ]);

        return $this->handleSuccess([
            'status' => 'sent',
            'mode' => 'log',
            'message' => 'SMS loggé (mode développement)'
        ]);
    }

    /**
     * Normaliser le numéro de téléphone
     */
    protected function normalizePhoneNumber(string $phone): string
    {
        // Supprimer les espaces et caractères spéciaux
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        // Si le numéro commence par 0, remplacer par +221 (Sénégal)
        if (str_starts_with($phone, '0')) {
            $phone = '+221' . substr($phone, 1);
        }
        // Si le numéro ne commence pas par +, ajouter +221
        elseif (!str_starts_with($phone, '+')) {
            $phone = '+221' . $phone;
        }

        return $phone;
    }

    /**
     * Gérer le succès
     */
    protected function handleSuccess(array $data = []): array
    {
        return [
            'success' => true,
            'message' => 'SMS envoyé avec succès',
            'data' => $data
        ];
    }

    /**
     * Gérer l'échec
     */
    protected function handleFailure(string $message): array
    {
        return [
            'success' => false,
            'message' => $message
        ];
    }
}

