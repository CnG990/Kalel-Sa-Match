<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | SMS Services Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration pour les services SMS (OTP, notifications, etc.)
    | Supporte: africas_talking, twilio, orange, messagebird, log (dev)
    |
    */

    'sms' => [
        'provider' => env('SMS_PROVIDER', 'log'), // log, africas_talking, twilio, orange, messagebird, ovh

        'providers' => [
            // Africa's Talking (Recommandé pour l'Afrique)
            'africas_talking' => [
                'username' => env('AFRICASTALKING_USERNAME'),
                'api_key' => env('AFRICASTALKING_API_KEY'),
                'sender_id' => env('AFRICASTALKING_SENDER_ID', 'KSM'),
            ],

            // Twilio
            'twilio' => [
                'account_sid' => env('TWILIO_ACCOUNT_SID'),
                'auth_token' => env('TWILIO_AUTH_TOKEN'),
                'from' => env('TWILIO_FROM_NUMBER'),
            ],

            // Orange SMS API
            'orange' => [
                'client_id' => env('ORANGE_SMS_CLIENT_ID'),
                'client_secret' => env('ORANGE_SMS_CLIENT_SECRET'),
                'sender_address' => env('ORANGE_SMS_SENDER_ADDRESS', '+221123456789'),
            ],

            // MessageBird
            'messagebird' => [
                'api_key' => env('MESSAGEBIRD_API_KEY'),
                'originator' => env('MESSAGEBIRD_ORIGINATOR', 'KSM'),
            ],

            // OVH SMS (Service OVH Telecom)
            'ovh' => [
                'account' => env('OVH_SMS_ACCOUNT'),
                'login' => env('OVH_SMS_LOGIN'),
                'password' => env('OVH_SMS_PASSWORD'),
                'sender' => env('OVH_SMS_SENDER', 'KSM'),
            ],

            // Log (pour développement - n'envoie pas vraiment de SMS)
            'log' => [
                'enabled' => true,
            ],
        ],
    ],

];
