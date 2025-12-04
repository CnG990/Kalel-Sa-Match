# 📱 Guide de Configuration SMS

Ce guide explique comment configurer les services SMS pour les deux applications (Terrains-Synthetiques et Kalel-Sa-Match).

## 📋 Vue d'ensemble

Les applications supportent plusieurs fournisseurs SMS pour l'envoi de :
- **Codes OTP** (One-Time Password) pour l'authentification
- **Messages de bienvenue** après inscription
- **Notifications** (confirmations de réservation, rappels, etc.)

## 🔧 Fournisseurs Supportés

### 1. **OVH SMS** ⭐ (Recommandé si vous utilisez OVH Cloud)
- ✅ **Service OVH Telecom** - Intégration native avec votre infrastructure OVH
- ✅ **Tarifs** : À partir de **0,070 € HT par SMS** (pack 100 SMS)
- ✅ **Remises progressives** selon le volume
- ✅ **Support français** disponible
- ✅ **Sécurité** : Infrastructure OVH sécurisée
- ✅ **Idéal** si vous hébergez déjà sur OVH Cloud

### 2. **Africa's Talking** (Recommandé pour l'Afrique)
- ✅ Idéal pour le Sénégal et l'Afrique de l'Ouest
- ✅ Tarifs compétitifs (~0.01-0.05 USD/SMS)
- ✅ Support local
- ✅ Bonne couverture en Afrique

### 3. **Twilio**
- ✅ Service international fiable
- ✅ Bonne documentation
- ⚠️ Peut être plus cher pour l'Afrique (~0.05-0.10 USD/SMS)

### 4. **Orange SMS API**
- ✅ Opérateur local au Sénégal
- ✅ Intégration directe avec Orange Money
- ⚠️ Tarifs variables selon contrat

### 5. **MessageBird**
- ✅ Service international
- ✅ Bonne couverture
- ⚠️ Tarifs moyens (~0.05-0.08 USD/SMS)

### 6. **Log** (Mode développement)
- ✅ Pour les tests sans envoyer de vrais SMS
- ✅ Log les messages dans les fichiers de log Laravel
- ✅ **GRATUIT** - Aucun coût

---

## 🚀 Configuration Rapide

### Étape 1 : Installer les dépendances

```bash
# Pour l'application Backend (Terrains-Synthetiques)
cd Backend
composer install

# Pour l'application Kalel-Sa-Match
cd Kalel-Sa-Match/Backend
composer install
```

### Étape 2 : Configurer les variables d'environnement

Ajoutez les variables suivantes dans vos fichiers `.env` :

#### **Mode Développement (Log uniquement)**
```env
SMS_PROVIDER=log
```

#### **Africa's Talking**
```env
SMS_PROVIDER=africas_talking
AFRICASTALKING_USERNAME=votre_username
AFRICASTALKING_API_KEY=votre_api_key
AFRICASTALKING_SENDER_ID=KSM
```

#### **Twilio**
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_FROM_NUMBER=+221XXXXXXXXX
```

#### **Orange SMS API**
```env
SMS_PROVIDER=orange
ORANGE_SMS_CLIENT_ID=votre_client_id
ORANGE_SMS_CLIENT_SECRET=votre_client_secret
ORANGE_SMS_SENDER_ADDRESS=+221123456789
```

#### **MessageBird**
```env
SMS_PROVIDER=messagebird
MESSAGEBIRD_API_KEY=votre_api_key
MESSAGEBIRD_ORIGINATOR=KSM
```

#### **OVH SMS** ⭐
```env
SMS_PROVIDER=ovh
OVH_SMS_ACCOUNT=votre_compte_ovh
OVH_SMS_LOGIN=votre_login_ovh
OVH_SMS_PASSWORD=votre_password_ovh
OVH_SMS_SENDER=KSM
```

**Note** : Pour obtenir vos identifiants OVH SMS :
1. Connectez-vous à votre espace client OVH
2. Allez dans **Télécom** → **SMS**
3. Créez un compte SMS si nécessaire
4. Récupérez vos identifiants (account, login, password)

---

## 📝 Exemples d'utilisation

### Dans un contrôleur

```php
use App\Services\SmsService;

// Envoyer un code OTP
$smsService = app(SmsService::class);
$result = $smsService->sendOTP('+221771234567', '123456');

if ($result['success']) {
    // Code OTP envoyé avec succès
} else {
    // Gérer l'erreur
    Log::error('Erreur SMS', $result);
}

// Envoyer un message personnalisé
$result = $smsService->send(
    '+221771234567',
    'Votre réservation est confirmée!'
);

// Envoyer un message de bienvenue
$result = $smsService->sendWelcomeMessage(
    '+221771234567',
    'Amadou Diallo'
);
```

### Dans AuthController (déjà intégré)

Le service SMS est déjà intégré dans les méthodes suivantes :
- `sendOTP()` - Envoie un code OTP par SMS
- `register()` - Envoie un SMS de bienvenue après inscription
- `registerWithPhone()` - Envoie un SMS de bienvenue après inscription avec téléphone

### Dans NotificationService (déjà intégré)

Les notifications SMS sont automatiquement envoyées via le `NotificationService` lorsque le canal `sms` est spécifié.

---

## 🔍 Vérification de la Configuration

### Tester l'envoi SMS

Créez une route de test (à retirer en production) :

```php
// routes/api.php
Route::get('/test-sms', function() {
    $smsService = app(\App\Services\SmsService::class);
    
    $result = $smsService->sendOTP(
        '+221771234567', // Remplacez par votre numéro
        '123456'
    );
    
    return response()->json($result);
});
```

### Vérifier les logs

En mode `log`, les SMS sont enregistrés dans :
```
storage/logs/laravel.log
```

Recherchez les entrées avec `SMS (Mode Log)`.

---

## 🎯 Cas d'usage

### 1. Inscription avec OTP

1. L'utilisateur entre son numéro de téléphone
2. Le système génère un code OTP à 6 chiffres
3. Le code est envoyé par SMS via `SmsService::sendOTP()`
4. L'utilisateur entre le code pour vérifier son numéro

### 2. Connexion avec OTP

1. L'utilisateur demande un code OTP
2. Le système envoie le code par SMS
3. L'utilisateur entre le code + PIN pour se connecter

### 3. Notifications SMS

Les notifications peuvent être envoyées par SMS via le `NotificationService` :

```php
$notificationService->send($user, 'reservation_confirmed', [
    'terrain_name' => 'Terrain A',
    'date' => '2025-01-15 18:00'
], [
    'channels' => ['database', 'email', 'sms']
]);
```

---

## ⚙️ Configuration Avancée

### Changer de fournisseur dynamiquement

```php
// Forcer un fournisseur spécifique
config(['services.sms.provider' => 'twilio']);

$smsService = app(SmsService::class);
$result = $smsService->send($phone, $message);
```

### Personnaliser le message OTP

Modifiez la méthode `sendOTP()` dans `SmsService.php` :

```php
public function sendOTP(string $to, string $code, ?string $appName = null): array
{
    $appName = $appName ?? config('app.name', 'KSM');
    $message = "Votre code {$appName}: {$code}. Valide 10 min.";
    
    return $this->send($to, $message);
}
```

---

## 🐛 Dépannage

### Le SMS n'est pas envoyé

1. **Vérifier la configuration** :
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

2. **Vérifier les logs** :
   ```bash
   tail -f storage/logs/laravel.log | grep SMS
   ```

3. **Vérifier les credentials** :
   - Assurez-vous que les variables d'environnement sont correctes
   - Vérifiez que les credentials sont valides avec le fournisseur

4. **Tester en mode log** :
   ```env
   SMS_PROVIDER=log
   ```
   Cela permet de voir si le problème vient de la configuration ou du fournisseur.

### Erreur "SMS Provider non configuré"

- Vérifiez que `SMS_PROVIDER` est défini dans `.env`
- Vérifiez que la configuration du fournisseur est complète dans `config/services.php`

### Erreur "Credentials manquantes"

- Vérifiez que toutes les variables d'environnement requises sont définies
- Consultez la section "Configuration" ci-dessus pour votre fournisseur

---

## 📊 Coûts Estimés et Comparaison

| Fournisseur | Coût par SMS | Notes | Payant ? |
|------------|-------------|-------|----------|
| **OVH SMS** ⭐ | **0,070 € HT** (pack 100) | Remises progressives selon volume | ✅ **OUI** |
| **Africa's Talking** | ~0.01-0.05 USD | Tarifs variables selon le pays | ✅ **OUI** |
| **Twilio** | ~0.05-0.10 USD | Plus cher mais très fiable | ✅ **OUI** |
| **Orange SMS** | Variable | Dépend de votre contrat | ✅ **OUI** |
| **MessageBird** | ~0.05-0.08 USD | Tarifs compétitifs | ✅ **OUI** |
| **Log** (dev) | **0 €** | Mode développement uniquement | ❌ **NON** |

### 💰 Détails des Coûts OVH SMS

**OVH propose des packs SMS avec remises progressives :**

| Volume | Prix par SMS (HT) | Exemple : 1000 SMS |
|--------|-------------------|-------------------|
| 100 SMS | 0,070 € | 7,00 € |
| 500 SMS | 0,060 € | 30,00 € |
| 1000 SMS | 0,050 € | 50,00 € |
| 5000 SMS | 0,040 € | 200,00 € |
| 10000+ SMS | Sur devis | Contactez OVH |

**Avantages OVH SMS :**
- ✅ Intégration facile si vous êtes déjà client OVH
- ✅ Support français
- ✅ Infrastructure sécurisée
- ✅ Pas de frais d'activation
- ✅ API simple et fiable

### 🎯 Recommandations par Cas d'Usage

**Si vous hébergez sur OVH Cloud :**
- ⭐ **OVH SMS** - Meilleure intégration, support unifié

**Si vous ciblez principalement l'Afrique :**
- 🌍 **Africa's Talking** - Meilleur rapport qualité/prix pour l'Afrique

**Si vous avez besoin d'une couverture mondiale :**
- 🌐 **Twilio** ou **MessageBird** - Services internationaux fiables

**Pour le développement/test :**
- 🧪 **Log** - Gratuit, parfait pour tester sans coût

---

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais exposer les credentials** :
   - Utilisez toujours les variables d'environnement
   - Ne commitez jamais le fichier `.env`

2. **Limiter les tentatives OTP** :
   - Implémentez un rate limiting (déjà fait dans AuthController)
   - Expirez les codes OTP après 10 minutes

3. **Valider les numéros de téléphone** :
   - Le service normalise automatiquement les numéros
   - Format attendu : `+221XXXXXXXXX`

4. **Logs sécurisés** :
   - En production, ne loggez pas les codes OTP complets
   - Masquez les numéros de téléphone dans les logs

---

## 📚 Ressources

### Documentation des fournisseurs

- [Africa's Talking API](https://developers.africastalking.com/docs/sms)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Orange SMS API](https://developer.orange.com/apis/sms-sn/)
- [MessageBird SMS API](https://developers.messagebird.com/api/sms-messaging/)

### Support

Pour toute question ou problème :
1. Consultez les logs : `storage/logs/laravel.log`
2. Vérifiez la configuration dans `config/services.php`
3. Testez en mode `log` pour isoler le problème

---

## ✅ Checklist de Configuration

- [ ] Installer les dépendances Composer (`composer install`)
- [ ] Configurer `SMS_PROVIDER` dans `.env`
- [ ] Ajouter les credentials du fournisseur dans `.env`
- [ ] Vider le cache de configuration (`php artisan config:clear`)
- [ ] Tester l'envoi SMS avec une route de test
- [ ] Vérifier les logs pour confirmer l'envoi
- [ ] Tester l'inscription avec OTP
- [ ] Tester les notifications SMS

---

**Dernière mise à jour** : Janvier 2025

