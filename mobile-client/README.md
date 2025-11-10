# Application Mobile Client - Kalel Sa Match (KSM)

Application Flutter Kalel Sa Match pour les clients - Réservation de terrains synthétiques.

## Fonctionnalités

- **Liste des terrains** : Recherche, filtres, terrains à proximité
- **Détails terrain** : Informations complètes, photos, prix
- **Réservation** : Sélection date/heure, durée, confirmation
- **Mes réservations** : Historique des réservations, codes tickets
- **Profil** : Informations du client

## Installation

```bash
cd mobile-client
flutter pub get
```

## Configuration

Modifiez l'URL de l'API dans `lib/services/api_service.dart` si nécessaire :
```dart
static const String baseUrl = 'http://127.0.0.1:8000/api';
```

## Lancement

```bash
flutter run
```

## Structure

```
lib/
├── main.dart
├── providers/
│   ├── auth_provider.dart
│   ├── terrain_provider.dart
│   └── reservation_provider.dart
├── services/
│   └── api_service.dart
└── screens/
    ├── auth/
    │   ├── login_screen.dart
    │   └── register_screen.dart
    ├── terrains/
    │   ├── terrains_screen.dart
    │   ├── terrain_detail_screen.dart
    │   └── reservation_screen.dart
    ├── reservations/
    │   └── my_reservations_screen.dart
    ├── profile/
    │   └── profile_screen.dart
    └── main_navigation.dart
```

