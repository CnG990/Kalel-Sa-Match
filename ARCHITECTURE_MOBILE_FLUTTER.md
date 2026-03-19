# Architecture Mobile Flutter : Laravel + Supabase + Firebase

## 🎯 Réponse Simple

**Les apps Flutter continuent de se connecter à Laravel** (comme actuellement), mais Laravel est maintenant connecté à Supabase PostgreSQL.

**Firebase gère uniquement les notifications push** pour les apps mobiles.

---

## 📱 Architecture Complète

```
┌─────────────────────────────────────────┐
│  Apps Flutter (Client + Gestionnaire)   │
│  ┌───────────────────────────────────┐  │
│  │  App Client                        │  │
│  │  - Réservations                   │  │
│  │  - Terrains                       │  │
│  │  - Profil                         │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  App Gestionnaire                 │  │
│  │  - Gestion terrains               │  │
│  │  - Statistiques                   │  │
│  │  - Réservations                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
┌───────────────┐      ┌───────────────┐
│   LARAVEL     │      │   FIREBASE    │
│   (Backend)   │      │               │
│               │      │ ✅ FCM        │
│ API REST      │      │ (Notifications│
│               │      │  Push)        │
│ Déployé sur   │      │               │
│ Cloud Run/    │      │ ✅ Analytics  │
│ Render        │      │               │
└───────────────┘      └───────────────┘
        ↓
┌───────────────┐
│   SUPABASE    │
│               │
│ ✅ PostgreSQL │
│ ✅ PostGIS    │
│ ✅ Storage    │
│ ✅ Auth       │
└───────────────┘
```

---

## 🔄 Flux de Données

### Exemple : Récupérer les Terrains depuis l'App Flutter

```
1. App Flutter Client
   ↓ http.get('https://votre-api.com/api/terrains')
   
2. Backend Laravel (Cloud Run/Render)
   ↓ DB::table('terrains_synthetiques_dakar')
   
3. Supabase PostgreSQL + PostGIS
   ↓ SELECT * FROM terrains_synthetiques_dakar
   
4. Retour à Laravel
   ↓ JSON response
   
5. Retour à l'App Flutter
   ↓ Affichage des terrains
```

### Exemple : Notification Push

```
1. Événement dans Laravel
   (ex: nouvelle réservation)
   ↓
   
2. Laravel envoie notification via Firebase FCM
   ↓
   
3. Firebase Cloud Messaging
   ↓
   
4. App Flutter reçoit la notification
   ↓
   
5. Affichage de la notification
```

---

## 📋 Répartition des Responsabilités

| Composant | Fournisseur | Rôle pour Mobile |
|-----------|-------------|------------------|
| **API Backend** | Laravel | ✅ Toutes les requêtes API |
| **Base de données** | Supabase | ✅ Stockage des données |
| **Authentification** | Laravel + Supabase | ✅ Login/Register (via Laravel) |
| **Notifications Push** | Firebase FCM | ✅ Notifications mobiles |
| **Storage Images** | Supabase | ✅ Images des terrains |
| **Analytics** | Firebase | ✅ Tracking des événements |

---

## 🔧 Configuration des Apps Flutter

### 1. Configuration de l'API Laravel

**Modifier `mobile-client/lib/services/api_service.dart`** :

```dart
class ApiService {
  // Ancien (développement local)
  // static String get baseUrl {
  //   if (kIsWeb) {
  //     return 'http://localhost:8000/api';
  //   } else if (Platform.isAndroid) {
  //     return 'http://10.0.2.2:8000/api';
  //   } else {
  //     return 'http://127.0.0.1:8000/api';
  //   }
  // }

  // Nouveau (production)
  static String get baseUrl {
    // Utiliser une variable d'environnement
    const String apiUrl = String.fromEnvironment(
      'API_URL',
      defaultValue: 'https://votre-api-laravel.com/api',
    );
    return apiUrl;
  }

  // OU utiliser un fichier de configuration
  static String get baseUrl {
    // Pour développement
    if (kDebugMode) {
      if (kIsWeb) {
        return 'http://localhost:8000/api';
      } else if (Platform.isAndroid) {
        return 'http://10.0.2.2:8000/api';
      } else {
        return 'http://127.0.0.1:8000/api';
      }
    }
    
    // Pour production
    return 'https://votre-api-laravel.com/api';
  }
}
```

### 2. Ajouter Firebase Cloud Messaging (FCM)

**Installer les dépendances** :

```yaml
# mobile-client/pubspec.yaml
dependencies:
  firebase_core: ^3.0.0
  firebase_messaging: ^15.0.0
  flutter_local_notifications: ^17.0.0
```

**Configuration** :

```dart
// mobile-client/lib/services/notification_service.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications = 
      FlutterLocalNotificationsPlugin();

  static Future<void> initialize() async {
    // Initialiser Firebase
    await Firebase.initializeApp();

    // Demander la permission
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('User granted permission');
    }

    // Obtenir le token FCM
    String? token = await _messaging.getToken();
    print('FCM Token: $token');
    
    // Envoyer le token à Laravel pour l'associer à l'utilisateur
    await sendTokenToBackend(token);

    // Configurer les notifications locales
    await _setupLocalNotifications();

    // Écouter les messages en foreground
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Écouter les messages en background
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);
  }

  static Future<void> _setupLocalNotifications() async {
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    
    const InitializationSettings initSettings =
        InitializationSettings(android: androidSettings);

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (details) {
        // Gérer le clic sur la notification
      },
    );
  }

  static Future<void> _handleForegroundMessage(RemoteMessage message) async {
    // Afficher une notification locale quand l'app est ouverte
    await _localNotifications.show(
      message.hashCode,
      message.notification?.title,
      message.notification?.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'high_importance_channel',
          'High Importance Notifications',
          importance: Importance.high,
        ),
      ),
    );
  }

  static void _handleBackgroundMessage(RemoteMessage message) {
    // Gérer les notifications en background
    print('Background message: ${message.messageId}');
  }

  static Future<void> sendTokenToBackend(String? token) async {
    if (token == null) return;
    
    // Envoyer le token à Laravel pour l'associer à l'utilisateur
    try {
      await http.post(
        Uri.parse('${ApiService.baseUrl}/notifications/register-token'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'fcm_token': token}),
      );
    } catch (e) {
      print('Error sending token to backend: $e');
    }
  }
}
```

**Dans `main.dart`** :

```dart
// mobile-client/lib/main.dart
import 'package:firebase_core/firebase_core.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialiser Firebase
  await Firebase.initializeApp();
  
  // Initialiser les notifications
  await NotificationService.initialize();
  
  runApp(MyApp());
}

// Handler pour les messages en background (doit être top-level)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('Handling background message: ${message.messageId}');
}
```

### 3. Configuration Firebase pour Flutter

1. **Créer un projet Firebase** :
   - Aller sur [Firebase Console](https://console.firebase.google.com)
   - Créer un nouveau projet
   - Ajouter les apps Android et iOS

2. **Télécharger les fichiers de configuration** :
   - `google-services.json` pour Android
   - `GoogleService-Info.plist` pour iOS

3. **Placer les fichiers** :
   - Android : `mobile-client/android/app/google-services.json`
   - iOS : `mobile-client/ios/Runner/GoogleService-Info.plist`

---

## 🔄 Intégration avec Laravel

### 1. Envoyer des Notifications depuis Laravel

**Installer le package Firebase Admin SDK** :

```bash
cd Backend
composer require kreait/firebase-php
```

**Créer un service de notification** :

```php
// Backend/app/Services/FCMService.php
<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class FCMService
{
    protected $messaging;

    public function __construct()
    {
        $factory = (new Factory)
            ->withServiceAccount(storage_path('app/firebase-credentials.json'));
        
        $this->messaging = $factory->createMessaging();
    }

    public function sendNotification($token, $title, $body, $data = [])
    {
        $notification = Notification::create($title, $body);
        
        $message = CloudMessage::withTarget('token', $token)
            ->withNotification($notification)
            ->withData($data);

        try {
            $this->messaging->send($message);
            return true;
        } catch (\Exception $e) {
            \Log::error('FCM Error: ' . $e->getMessage());
            return false;
        }
    }

    public function sendToUser($userId, $title, $body, $data = [])
    {
        // Récupérer le token FCM de l'utilisateur
        $user = \App\Models\User::find($userId);
        if ($user && $user->fcm_token) {
            return $this->sendNotification($user->fcm_token, $title, $body, $data);
        }
        return false;
    }
}
```

**Exemple d'utilisation dans un contrôleur** :

```php
// Backend/app/Http/Controllers/API/ReservationController.php
use App\Services\FCMService;

public function store(Request $request)
{
    // Créer la réservation
    $reservation = Reservation::create([...]);
    
    // Envoyer une notification au gestionnaire
    $fcmService = new FCMService();
    $fcmService->sendToUser(
        $reservation->terrain->gestionnaire_id,
        'Nouvelle réservation',
        "Réservation pour {$reservation->terrain->nom}",
        [
            'type' => 'new_reservation',
            'reservation_id' => $reservation->id,
        ]
    );
    
    return response()->json($reservation);
}
```

### 2. Stocker les Tokens FCM

**Migration** :

```php
// Backend/database/migrations/xxxx_add_fcm_token_to_users.php
Schema::table('users', function (Blueprint $table) {
    $table->string('fcm_token')->nullable()->after('remember_token');
});
```

**Route API** :

```php
// Backend/routes/api.php
Route::middleware('auth:sanctum')->post('/notifications/register-token', function (Request $request) {
    $request->user()->update([
        'fcm_token' => $request->fcm_token
    ]);
    return response()->json(['message' => 'Token enregistré']);
});
```

---

## 📊 Architecture Finale

```
┌─────────────────────────────────────────┐
│  Apps Flutter                          │
│  ├─ Client App                         │
│  └─ Gestionnaire App                   │
└─────────────────────────────────────────┘
        ↓ HTTP/REST API
┌─────────────────────────────────────────┐
│  Backend Laravel                        │
│  ├─ API REST                            │
│  ├─ Authentification                    │
│  ├─ Logique métier                      │
│  └─ Envoi notifications FCM             │
└─────────────────────────────────────────┘
        ↓ Connexion PostgreSQL
┌─────────────────────────────────────────┐
│  Supabase                               │
│  ├─ PostgreSQL + PostGIS                │
│  ├─ Storage (Images)                    │
│  └─ Auth (optionnel)                    │
└─────────────────────────────────────────┘
        ↓ FCM
┌─────────────────────────────────────────┐
│  Firebase                               │
│  ├─ Cloud Messaging (FCM)              │
│  └─ Analytics                           │
└─────────────────────────────────────────┘
```

---

## ✅ Résumé

### Pour les Apps Flutter :

1. ✅ **API Backend** : Continuent d'appeler Laravel (comme actuellement)
2. ✅ **Base de données** : Laravel se connecte à Supabase (transparent pour Flutter)
3. ✅ **Notifications** : Firebase FCM pour les notifications push
4. ✅ **Storage** : Supabase Storage pour les images (via Laravel ou directement)

### Changements nécessaires dans Flutter :

1. ✅ Changer l'URL de l'API (de localhost vers l'URL de production)
2. ✅ Ajouter Firebase FCM pour les notifications
3. ✅ Enregistrer le token FCM et l'envoyer à Laravel

### Aucun changement nécessaire :

- ❌ Pas besoin de changer la structure de l'API
- ❌ Pas besoin de modifier les appels API existants
- ❌ Pas besoin de changer l'authentification (reste Laravel Sanctum)

---

## 🚀 Prochaines Étapes

1. ✅ Déployer Laravel sur Cloud Run ou Render
2. ✅ Connecter Laravel à Supabase PostgreSQL
3. ✅ Configurer Firebase FCM dans les apps Flutter
4. ✅ Mettre à jour l'URL de l'API dans Flutter
5. ✅ Tester les notifications push

**Votre code Flutter reste presque identique !** 🎉

