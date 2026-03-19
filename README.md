# 🏟️ Kalel Sa Match (KSM) - Plateforme de Réservation de Terrains Synthétiques

> **Plateforme complète de gestion et réservation de terrains de football synthétiques au Sénégal**

[![Laravel](https://img.shields.io/badge/Laravel-12.0-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org)
[![Flutter](https://img.shields.io/badge/Flutter-3.0-blue.svg)](https://flutter.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.0+-green.svg)](https://postgis.net)

---

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Objectifs du Projet](#objectifs-du-projet)
- [Architecture Technique](#architecture-technique)
- [Technologies Utilisées](#technologies-utilisées)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Applications](#applications)
- [Structure du Projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Documentation](#documentation)

---

## 🎯 Vue d'ensemble

**Kalel Sa Match (KSM)** est une plateforme complète de gestion et réservation de terrains de football synthétiques développée pour le marché sénégalais. La solution intègre des technologies géospatiales avancées (PostGIS) pour la gestion cartographique des terrains, un système de réservation en temps réel, des applications mobiles natives, et un panel d'administration complet.

### Caractéristiques Principales

- ✅ **Gestion géospatiale** : Intégration PostGIS pour la cartographie et l'analyse spatiale
- ✅ **Multi-plateformes** : Web (React), Mobile (Flutter), API REST (Laravel)
- ✅ **Authentification sécurisée** : OTP + PIN (style Wave Sénégal)
- ✅ **Système de réservation** : Réservations ponctuelles et abonnements
- ✅ **Gestion financière** : Paiements, commissions, remboursements
- ✅ **Support client** : Tickets, litiges, notifications
- ✅ **Analytics** : Tableaux de bord, rapports, statistiques

---

## 🎯 Objectifs du Projet

### Objectif Principal
Créer une plateforme moderne et complète pour la gestion et la réservation de terrains de football synthétiques, intégrant des technologies géospatiales avancées pour une expérience utilisateur optimale.

### Objectifs Spécifiques

1. **Gestion Géospatiale**
   - Import de données géomatiques (KML, SHP, GeoJSON, CSV)
   - Calcul automatique des surfaces avec PostGIS
   - Visualisation cartographique interactive
   - Recherche par proximité géographique

2. **Expérience Utilisateur**
   - Applications mobiles natives (iOS/Android)
   - Interface web responsive
   - Authentification simplifiée (OTP + PIN)
   - Navigation intuitive

3. **Gestion Opérationnelle**
   - Système de réservation complet
   - Gestion des paiements et commissions
   - Support client intégré
   - Analytics et rapports

---

## 🏗️ Architecture Technique

### Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATIONS CLIENT                       │
├──────────────────┬──────────────────┬────────────────────────┤
│  Web (React)     │  Mobile Client  │  Mobile Gestionnaire   │
│  - Frontend      │  (Flutter)      │  (Flutter)             │
│  - Admin Panel   │  - Réservation  │  - Gestion             │
└────────┬─────────┴────────┬────────┴────────┬───────────────┘
         │                   │                  │
         └───────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API REST      │
                    │   (Laravel)     │
                    │   - Sanctum     │
                    │   - Validation  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌─────▼─────┐      ┌─────▼─────┐
    │PostgreSQL│        │   Redis   │      │  Storage  │
    │+ PostGIS │        │  (Cache) │      │  (Files)  │
    └──────────┘        └──────────┘      └───────────┘
```

### Stack Technologique

#### Backend
- **Framework** : Laravel 12.0
- **Base de données** : PostgreSQL 15+ avec PostGIS 3.0+
- **Cache** : Redis
- **Authentification** : Laravel Sanctum
- **API** : RESTful API

#### Frontend Web
- **Framework** : React 19.1 + TypeScript
- **Styling** : Tailwind CSS
- **Cartographie** : Leaflet / React Leaflet
- **Routing** : React Router v7
- **State Management** : React Query
- **Build** : Vite

#### Applications Mobiles
- **Framework** : Flutter 3.0+
- **State Management** : Provider
- **Cartographie** : flutter_map (OpenStreetMap)
- **Localisation** : geolocator
- **QR Code** : qr_flutter, mobile_scanner

---

## 🛠️ Technologies Utilisées

### Backend
```json
{
  "php": "^8.2",
  "laravel/framework": "^12.0",
  "laravel/sanctum": "*",
  "postgresql": "15+",
  "postgis": "3.0+",
  "redis": "latest"
}
```

### Frontend Web
```json
{
  "react": "^19.1.0",
  "typescript": "~5.8.3",
  "tailwindcss": "^3.4.6",
  "leaflet": "^1.9.4",
  "react-router-dom": "^7.7.2",
  "@tanstack/react-query": "^5.80.10"
}
```

### Mobile
```yaml
flutter: ">=3.0.0"
provider: "^6.1.1"
flutter_map: "^7.0.2"
geolocator: "^11.0.0"
mobile_scanner: "^5.0.0"
```

---

## ✨ Fonctionnalités Principales

### 👥 Gestion des Utilisateurs

#### Clients
- ✅ Inscription avec authentification OTP + PIN
- ✅ Profil utilisateur complet
- ✅ Modification des informations personnelles
- ✅ Historique des réservations
- ✅ Favoris de terrains
- ✅ Avis et notes sur les terrains

#### Gestionnaires
- ✅ Inscription avec validation admin
- ✅ Dashboard de gestion
- ✅ Gestion des réservations
- ✅ Scanner QR code pour validation
- ✅ Statistiques de revenus
- ✅ Contrats de commission

#### Administrateurs
- ✅ Panel d'administration complet
- ✅ Gestion des utilisateurs et terrains
- ✅ Validation des gestionnaires
- ✅ Gestion financière
- ✅ Support et litiges
- ✅ Analytics et rapports

### 🏟️ Gestion des Terrains

- ✅ **CRUD complet** : Création, modification, suppression
- ✅ **Import géomatique** : KML, SHP, GeoJSON, CSV
- ✅ **Calcul automatique** : Surfaces avec PostGIS
- ✅ **Visualisation cartographique** : Carte interactive
- ✅ **Recherche avancée** : Par nom, adresse, proximité
- ✅ **Images** : Upload et gestion d'images
- ✅ **Prix variables** : Par heure, par session
- ✅ **Disponibilité** : Gestion des créneaux

### 📅 Système de Réservation

#### Réservations Ponctuelles
- ✅ Sélection de date et heure
- ✅ Durée personnalisable
- ✅ Calcul automatique du prix
- ✅ Génération de tickets QR
- ✅ Validation par gestionnaire
- ✅ Annulation avec politique de remboursement

#### Abonnements
- ✅ Abonnements mensuels, trimestriels, annuels
- ✅ Configuration personnalisée
- ✅ Prix réduit pour abonnés
- ✅ Paiement différé (acompte)
- ✅ Gestion des sessions

### 💳 Gestion Financière

- ✅ **Paiements** : Orange Money, Wave, Cash
- ✅ **Commissions** : Contrats personnalisés par gestionnaire
- ✅ **Remboursements** : Politique automatique
  - 12h+ avant : Remboursement complet
  - < 12h avant : Perte de l'acompte
  - No-Show : Pénalité supplémentaire
- ✅ **Statistiques** : Revenus, commissions, à reverser

### 🎫 Système de Tickets

- ✅ Génération automatique de codes QR
- ✅ Validation par scanner mobile
- ✅ Validation manuelle par code
- ✅ Historique des validations
- ✅ Statut en temps réel

### ⭐ Système d'Avis

- ✅ Notation des terrains (1-5 étoiles)
- ✅ Commentaires des utilisateurs
- ✅ Calcul automatique de la moyenne
- ✅ Modération par admin
- ✅ Affichage dans les détails des terrains

### ❤️ Favoris

- ✅ Ajout/retrait de terrains favoris
- ✅ Liste dédiée des favoris
- ✅ Accès rapide aux terrains préférés

### 🗺️ Cartographie

- ✅ **Carte interactive** : OpenStreetMap / Leaflet
- ✅ **Marqueurs** : Position des terrains
- ✅ **Recherche** : Par nom ou adresse
- ✅ **Géolocalisation** : Position de l'utilisateur
- ✅ **Directions** : Intégration Google Maps

### 📱 Applications Mobiles

#### Application Client
- ✅ Carte interactive des terrains
- ✅ Recherche et filtres
- ✅ Détails des terrains
- ✅ Réservation en ligne
- ✅ Mes réservations
- ✅ Favoris
- ✅ Profil utilisateur
- ✅ Avis et notes

#### Application Gestionnaire
- ✅ Dashboard avec statistiques
- ✅ Liste des réservations
- ✅ Scanner QR code
- ✅ Validation des tickets
- ✅ Statistiques de revenus
- ✅ Profil gestionnaire

### 🎛️ Panel d'Administration

#### Pages Principales (9 éléments)
1. **Tableau de Bord** : Statistiques globales
2. **Validations** : Approbation des gestionnaires
3. **Utilisateurs** : Gestion complète des utilisateurs
4. **Terrains** : Gestion + Import géomatique
5. **Réservations** : Gestion + Abonnements
6. **Finances** : Vue d'ensemble + Paiements + Commissions
7. **Support** : Tickets + Litiges
8. **Rapports** : Analytics et exports
9. **Configuration** : Paramètres système + Notifications + Logs

### 🔔 Notifications

- ✅ Notifications système
- ✅ Templates personnalisables
- ✅ Ciblage par rôles
- ✅ Notifications programmées
- ⏸️ Push notifications (reporté - SMS après hébergement)

### 📊 Analytics & Rapports

- ✅ Dashboard avec statistiques
- ✅ Rapports financiers
- ✅ Rapports d'utilisation
- ✅ Exports (CSV, Excel, PDF)
- ✅ Logs système

---

## 📱 Applications

### 1. Backend API (Laravel)

**Localisation** : `Backend/`

**Fonctionnalités** :
- API RESTful complète
- Authentification Sanctum
- Gestion PostGIS
- Validation des données
- Gestion des fichiers
- Queue jobs

**Routes principales** :
- `/api/auth/*` : Authentification
- `/api/terrains/*` : Gestion des terrains
- `/api/reservations/*` : Réservations
- `/api/admin/*` : Administration
- `/api/manager/*` : Gestionnaire

### 2. Frontend Web (React)

**Localisation** : `Frontend/`

**Pages principales** :
- **Public** : Accueil, Catalogue, Inscription, Connexion
- **Client** : Carte, Réservations, Profil
- **Gestionnaire** : Dashboard, Réservations, Revenus
- **Admin** : Panel complet (9 sections)

**Technologies** :
- React 19 + TypeScript
- Tailwind CSS
- Leaflet pour la cartographie
- React Router pour la navigation

### 3. Application Mobile Client (Flutter)

**Localisation** : `mobile-client/`

**Écrans principaux** :
- Carte interactive
- Détails terrain
- Réservation
- Mes réservations
- Favoris
- Profil

**Fonctionnalités** :
- Authentification OTP + PIN
- Recherche de terrains
- Réservation en ligne
- QR codes des tickets
- Directions Google Maps

### 4. Application Mobile Gestionnaire (Flutter)

**Localisation** : `mobile-gestionnaire/`

**Écrans principaux** :
- Dashboard
- Réservations
- Scanner QR
- Revenus
- Profil

**Fonctionnalités** :
- Gestion des réservations
- Validation par QR code
- Statistiques de revenus
- Profil gestionnaire

---

## 📁 Structure du Projet

```
Terrains-Synthetiques/
├── Backend/                    # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/   # Contrôleurs API
│   │   ├── Models/             # Modèles Eloquent
│   │   └── Services/            # Services métier
│   ├── database/
│   │   ├── migrations/          # Migrations
│   │   └── seeders/             # Seeders
│   └── routes/
│       └── api.php              # Routes API
│
├── Frontend/                    # Application Web React
│   ├── src/
│   │   ├── pages/               # Pages
│   │   │   ├── admin/            # Panel admin
│   │   │   ├── client/           # Pages client
│   │   │   └── public/           # Pages publiques
│   │   ├── components/           # Composants réutilisables
│   │   ├── services/             # Services API
│   │   └── context/              # Context React
│   └── package.json
│
├── mobile-client/               # App Flutter Client
│   ├── lib/
│   │   ├── screens/              # Écrans
│   │   ├── services/             # Services API
│   │   └── providers/            # State management
│   └── pubspec.yaml
│
├── mobile-gestionnaire/         # App Flutter Gestionnaire
│   ├── lib/
│   │   ├── screens/              # Écrans
│   │   ├── services/             # Services API
│   │   └── providers/            # State management
│   └── pubspec.yaml
│
└── README.md                    # Ce fichier
```

---

## 🚀 Installation

### Prérequis

- **PHP** : 8.2+
- **Composer** : 2.0+
- **Node.js** : 18+
- **PostgreSQL** : 15+ avec PostGIS 3.0+
- **Redis** : 7.0+
- **Flutter** : 3.0+ (pour les apps mobiles)

### Installation Backend

```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate

# Configuration de la base de données dans .env
php artisan migrate
php artisan db:seed
php artisan serve
```

### Installation Frontend

```bash
cd Frontend
npm install
npm run dev
```

### Installation Mobile Client

```bash
cd mobile-client
flutter pub get
flutter run
```

### Installation Mobile Gestionnaire

```bash
cd mobile-gestionnaire
flutter pub get
flutter run
```

---

## ⚙️ Configuration

### Variables d'Environnement Backend

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=terrains_synthetiques
DB_USERNAME=postgres
DB_PASSWORD=

CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://127.0.0.1:5173
```

### Configuration Frontend

Modifier `Frontend/src/services/api.ts` :
```typescript
const BASE_URL = 'http://127.0.0.1:8000';
const API_BASE = `${BASE_URL}/api`;
```

### Configuration Mobile

Modifier `mobile-client/lib/services/api_service.dart` :
```dart
static const String baseUrl = 'http://127.0.0.1:8000/api';
```

---

## 📚 Documentation

### Documentation Disponible

- **`VERIFICATION_COMMUNICATION_API.md`** : Vérification de la communication API
- **`VERIFICATION_INTERFACE_ADMIN.md`** : Vérification de l'interface admin
- **`FONCTIONNALITES_MANQUANTES.md`** : Fonctionnalités à implémenter
- **`TEST_ADMIN_INTERFACE.md`** : Tests de l'interface admin
- **`SIMPLIFICATION_NAVIGATION_ADMIN.md`** : Simplification de la navigation

### Guides Spécifiques

- **Backend** : Voir `Backend/README.md`
- **Frontend** : Voir `Frontend/README.md`
- **Mobile Client** : Voir `mobile-client/README.md`
- **Mobile Gestionnaire** : Voir `mobile-gestionnaire/README.md`

---

## 🎯 Fonctionnalités par Rôle

### 👤 Client
- Recherche et visualisation de terrains
- Réservation en ligne
- Gestion des réservations
- Favoris
- Avis et notes
- Profil utilisateur

### 👨‍💼 Gestionnaire
- Dashboard de gestion
- Gestion des réservations
- Validation par QR code
- Statistiques de revenus
- Profil gestionnaire

### 👨‍💻 Administrateur
- Gestion complète des utilisateurs
- Gestion des terrains
- Import géomatique
- Gestion financière
- Support et litiges
- Analytics et rapports
- Configuration système

---

## 🔐 Sécurité

- ✅ Authentification sécurisée (Sanctum)
- ✅ Validation des données
- ✅ Protection CSRF
- ✅ Rate limiting
- ✅ Hashing des mots de passe
- ✅ OTP pour authentification
- ✅ PIN pour accès rapide

---

## 📊 Statistiques du Projet

- **Backend** : 55+ fichiers PHP
- **Frontend** : 142+ fichiers TSX
- **Mobile Client** : 31+ fichiers Dart
- **Mobile Gestionnaire** : 20+ fichiers Dart
- **Total** : 250+ fichiers de code

---

## 🚧 État du Projet

### ✅ Fonctionnalités Implémentées

- ✅ Authentification complète
- ✅ Gestion des terrains
- ✅ Système de réservation
- ✅ Gestion financière
- ✅ Applications mobiles
- ✅ Panel d'administration
- ✅ Système d'avis
- ✅ Favoris
- ✅ Scanner QR code
- ✅ Cartographie interactive

### ⏸️ En Attente

- ⏸️ Push notifications (reporté - SMS après hébergement)
- ⏸️ Génération PDF des tickets
- ⏸️ Chat/Messagerie
- ⏸️ Analytics avancés

---

## 👥 Équipe

**Développement** : Équipe Kalel Sa Match  
**Date de création** : 2024  
**Dernière mise à jour** : Janvier 2025

---

## 📄 Licence

Ce projet est propriétaire. Tous droits réservés.

---

## 📞 Contact

Pour toute question ou support :
- **Email** : support@kalelsamatch.com
- **WhatsApp** : +221 XX XXX XX XX

---

**Kalel Sa Match** - *Votre partenaire pour la gestion de terrains synthétiques* 🏟️⚽

