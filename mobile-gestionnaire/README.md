# Application Mobile Gestionnaire - Kalel Sa Match (KSM)

Application Flutter Kalel Sa Match pour les gestionnaires de terrains synthétiques.

## Fonctionnalités

- **Tableau de bord** : Statistiques (terrains, réservations, revenus, taux d'occupation)
- **Gestion des terrains** : Liste, modification des prix, activation/désactivation
- **Gestion des réservations** : Voir, confirmer, refuser les réservations
- **Profil** : Informations du gestionnaire

## Installation

```bash
cd mobile-gestionnaire
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
    │   └── login_screen.dart
    ├── dashboard/
    │   └── dashboard_screen.dart
    ├── terrains/
    │   ├── terrains_screen.dart
    │   └── terrain_detail_dialog.dart
    ├── reservations/
    │   ├── reservations_screen.dart
    │   └── reservation_detail_dialog.dart
    ├── profile/
    │   └── profile_screen.dart
    └── main_navigation.dart
```

