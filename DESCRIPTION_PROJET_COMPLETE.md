# 📖 DESCRIPTION COMPLÈTE DU PROJET - Kalel Sa Match (KSM)

> **Application complète de gestion et réservation de terrains de football synthétiques au Sénégal**

---

## 📋 Table des Matières

1. [Vue d'ensemble Générale](#vue-densemble-générale)
2. [Contexte et Justification](#contexte-et-justification)
3. [Objectifs du Projet](#objectifs-du-projet)
4. [Architecture Technique Complète](#architecture-technique-complète)
5. [Stack Technologique Détaillée](#stack-technologique-détaillée)
6. [Fonctionnalités Détaillées par Module](#fonctionnalités-détaillées-par-module)
7. [Applications et Interfaces](#applications-et-interfaces)
8. [Base de Données](#base-de-données)
9. [API REST - Endpoints Complets](#api-rest---endpoints-complets)
10. [Sécurité et Authentification](#sécurité-et-authentification)
11. [Gestion Géospatiale](#gestion-géospatiale)
12. [Workflows et Processus](#workflows-et-processus)
13. [Installation et Configuration](#installation-et-configuration)
14. [Documentation Technique](#documentation-technique)

---

## 🎯 Vue d'ensemble Générale

### Présentation du Projet

**Kalel Sa Match (KSM)** est une application digitale complète développée pour moderniser la gestion et la réservation de terrains de football synthétiques au Sénégal. Cette solution combine les technologies géospatiales avancées (PostGIS) avec le développement d'applications web et mobiles modernes pour offrir une expérience utilisateur optimale.

### Problématique Résolue

**Avant KSM :**
- Gestion manuelle des réservations (appels téléphoniques, cahiers)
- Absence de visibilité géographique des terrains
- Difficultés de recherche et de localisation
- Pas de système de paiement intégré
- Gestion financière complexe (commissions, remboursements)
- Absence de suivi et d'analytics

**Avec KSM :**
- ✅ Réservation en ligne 24/7
- ✅ Carte interactive avec géolocalisation
- ✅ Recherche avancée par proximité
- ✅ Paiements intégrés (Orange Money, Wave, Cash)
- ✅ Gestion automatique des commissions
- ✅ Analytics et rapports en temps réel
- ✅ Support client intégré

### Public Cible

1. **Clients** : Joueurs de football cherchant à réserver des terrains
2. **Gestionnaires** : Propriétaires/gestionnaires de terrains synthétiques
3. **Administrateurs** : Équipe KSM pour la gestion globale de l'application

---

## 📚 Contexte et Justification

### Contexte Géographique

Le projet couvre l'ensemble du **Sénégal**, où se trouve une forte concentration de terrains de football synthétiques. La demande pour ces terrains est élevée, mais la gestion reste traditionnelle.

### Justification Technique

1. **Intégration Géomatique** : Utilisation de PostGIS pour la gestion spatiale des terrains
2. **Multi-applications** : Web, iOS, Android pour une accessibilité maximale
3. **Authentification Moderne** : OTP + PIN inspiré de Wave Sénégal
4. **Architecture Scalable** : Laravel + React + Flutter pour une croissance future

### Valeur Ajoutée

- **Pour les Clients** : Facilité de réservation, recherche par proximité, paiement sécurisé
- **Pour les Gestionnaires** : Automatisation, analytics, gestion simplifiée
- **Pour KSM** : Commission automatique, visibilité, scalabilité

---

## 🎯 Objectifs du Projet

### Objectif Principal

Créer une application digitale complète et moderne pour la gestion et la réservation de terrains de football synthétiques, intégrant des technologies géospatiales avancées pour une expérience utilisateur optimale et une gestion opérationnelle efficace.

### Objectifs Spécifiques

#### 1. Gestion Géospatiale
- ✅ Import de données géomatiques (KML, SHP, GeoJSON, CSV)
- ✅ Calcul automatique des surfaces avec PostGIS
- ✅ Visualisation cartographique interactive
- ✅ Recherche par proximité géographique
- ✅ Calcul de distances et itinéraires

#### 2. Expérience Utilisateur
- ✅ Applications mobiles natives (iOS/Android)
- ✅ Interface web responsive
- ✅ Authentification simplifiée (OTP + PIN)
- ✅ Navigation intuitive et moderne
- ✅ Design cohérent sur toutes les applications

#### 3. Gestion Opérationnelle
- ✅ Système de réservation complet
- ✅ Gestion des paiements et commissions
- ✅ Support client intégré
- ✅ Analytics et rapports
- ✅ Automatisation des processus

#### 4. Sécurité et Performance
- ✅ Authentification sécurisée
- ✅ Validation des données
- ✅ Protection contre les attaques
- ✅ Optimisation des performances
- ✅ Scalabilité

---

## 🏗️ Architecture Technique Complète

### Architecture Générale

```
┌─────────────────────────────────────────────────────────────────┐
│                      COUCHE PRÉSENTATION                          │
├──────────────────────┬──────────────────┬────────────────────────┤
│  Frontend Web        │  Mobile Client   │  Mobile Gestionnaire   │
│  (React + TS)        │  (Flutter)       │  (Flutter)             │
│  - Admin Panel       │  - Réservation   │  - Gestion             │
│  - Client Portal     │  - Carte         │  - Scanner QR          │
│  - Public Pages      │  - Favoris       │  - Revenus             │
└──────────┬───────────┴────────┬─────────┴────────┬───────────────┘
           │                     │                  │
           └─────────────────────┼──────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    COUCHE API REST      │
                    │    (Laravel 12.0)       │
                    │    - Sanctum Auth       │
                    │    - Validation         │
                    │    - Rate Limiting      │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
    ┌────▼────┐          ┌──────▼──────┐        ┌──────▼──────┐
    │PostgreSQL│          │    Redis    │        │   Storage   │
    │+ PostGIS │          │   (Cache)   │        │   (Files)   │
    │ 15+      │          │             │        │             │
    └──────────┘          └─────────────┘        └─────────────┘
```

### Architecture en Couches

#### 1. Couche Présentation
- **Frontend Web** : React 19 + TypeScript + Tailwind CSS
- **Mobile Client** : Flutter 3.0+ avec Provider
- **Mobile Gestionnaire** : Flutter 3.0+ avec Provider

#### 2. Couche API
- **Backend** : Laravel 12.0
- **Authentification** : Laravel Sanctum
- **Validation** : Form Requests
- **Rate Limiting** : Protection contre les abus

#### 3. Couche Données
- **Base de données** : PostgreSQL 15+ avec PostGIS 3.0+
- **Cache** : Redis 7.0+
- **Storage** : Système de fichiers Laravel

#### 4. Couche Services
- **Services métier** : Logique applicative
- **Queue Jobs** : Traitement asynchrone
- **Notifications** : Email, SMS (futur)

---

## 🛠️ Stack Technologique Détaillée

### Backend (Laravel 12.0)

#### Framework et Core
```json
{
  "php": "^8.2",
  "laravel/framework": "^12.0",
  "laravel/sanctum": "*",
  "laravel/tinker": "^2.10.1"
}
```

#### Extensions PHP
- **PostGIS** : Extension PostgreSQL pour données géospatiales
- **GD/Imagick** : Traitement d'images
- **Redis** : Cache et sessions
- **cURL** : Requêtes HTTP externes

#### Packages Laravel
- **simplesoftwareio/simple-qrcode** : Génération de QR codes
- **Laravel Sanctum** : Authentification API
- **Laravel Queue** : Traitement asynchrone

### Frontend Web (React 19.1)

#### Core
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "typescript": "~5.8.3"
}
```

#### UI et Styling
- **Tailwind CSS** : Framework CSS utility-first
- **Lucide React** : Bibliothèque d'icônes
- **React Hot Toast** : Notifications toast

#### Cartographie
- **Leaflet** : Bibliothèque de cartographie
- **React Leaflet** : Composants React pour Leaflet
- **Mapbox GL** : Alternative pour cartes avancées

#### Routing et State
- **React Router v7** : Navigation
- **React Query** : Gestion des données serveur
- **Context API** : State management global

#### Build Tools
- **Vite** : Build tool moderne
- **TypeScript** : Typage statique
- **ESLint** : Linting

### Mobile (Flutter 3.0+)

#### Core
```yaml
flutter: ">=3.0.0"
dart: ">=3.0.0"
```

#### State Management
- **Provider** : State management réactif

#### UI
- **Material Design** : Composants Material
- **Google Fonts** : Polices personnalisées
- **Flutter SVG** : Support SVG

#### Fonctionnalités
- **flutter_map** : Cartographie (OpenStreetMap)
- **geolocator** : Géolocalisation
- **mobile_scanner** : Scanner QR code
- **qr_flutter** : Génération QR code
- **url_launcher** : Ouverture d'apps externes
- **shared_preferences** : Stockage local
- **package_info_plus** : Informations app

#### Networking
- **http** : Requêtes HTTP
- **dio** : Client HTTP avancé

### Base de Données

#### PostgreSQL 15+
- **Moteur** : PostgreSQL avec PostGIS 3.0+
- **Encodage** : UTF-8
- **Extensions** : PostGIS, pg_trgm (recherche)

#### Redis 7.0+
- **Cache** : Mise en cache des requêtes
- **Sessions** : Stockage des sessions
- **Queue** : Jobs asynchrones

---

## ✨ Fonctionnalités Détaillées par Module

### 1. Module Authentification

#### Flux d'Inscription Client
1. **Saisie du numéro de téléphone**
2. **Réception d'un code OTP** (6 chiffres)
3. **Vérification de l'OTP**
4. **Création d'un PIN** (4 chiffres)
5. **Confirmation du PIN**
6. **Saisie des informations personnelles** (nom, prénom, email optionnel)
7. **Acceptation des conditions d'utilisation**
8. **Inscription complète**

#### Flux de Connexion
1. **Saisie du numéro de téléphone**
2. **Réception d'un code OTP**
3. **Vérification de l'OTP**
4. **Saisie du PIN**
5. **Connexion réussie**

#### Connexion Rapide (App mémorisée)
1. **Saisie du numéro de téléphone**
2. **Saisie du PIN**
3. **Connexion immédiate**

#### Flux d'Inscription Gestionnaire
1. **Saisie des informations** (nom, prénom, email, téléphone)
2. **Informations entreprise** (nom, NINEA, adresse)
3. **Mot de passe**
4. **Acceptation des conditions**
5. **Statut** : `en_attente` (validation admin requise)

#### Fonctionnalités
- ✅ Génération OTP sécurisée
- ✅ Expiration OTP (5 minutes)
- ✅ Hashing PIN (bcrypt)
- ✅ Tokens Sanctum
- ✅ Refresh tokens
- ✅ Remember device
- ✅ Réinitialisation mot de passe

### 2. Module Gestion des Terrains

#### CRUD Terrains
- ✅ **Création** : Nom, adresse, coordonnées, prix, capacité
- ✅ **Modification** : Tous les champs modifiables
- ✅ **Suppression** : Soft delete ou hard delete
- ✅ **Liste** : Pagination, recherche, filtres

#### Import Géomatique
- ✅ **KML/KMZ** : Fichiers Google Earth
- ✅ **Shapefile** : SHP, DBF, SHX, PRJ
- ✅ **GeoJSON** : Format JSON géospatial
- ✅ **CSV** : Données KoboCollect avec coordonnées GPS

#### Calcul PostGIS
- ✅ **Surface automatique** : `ST_Area(ST_Transform(geom_polygon, 32628))`
- ✅ **Centroïde** : `ST_Centroid(geom_polygon)`
- ✅ **Géométrie GeoJSON** : `ST_AsGeoJSON(geom_polygon)`
- ✅ **Validation** : Vérification de la validité des géométries

#### Recherche et Filtres
- ✅ **Par nom** : Recherche textuelle
- ✅ **Par adresse** : Recherche géographique
- ✅ **Par proximité** : Distance depuis un point
- ✅ **Par prix** : Fourchette de prix
- ✅ **Par disponibilité** : Terrains disponibles

#### Images
- ✅ **Upload multiple** : Plusieurs images par terrain
- ✅ **Image principale** : Image de couverture
- ✅ **Redimensionnement** : Optimisation automatique
- ✅ **Stockage** : Système de fichiers Laravel

### 3. Module Réservations

#### Création de Réservation
1. **Sélection du terrain**
2. **Choix de la date**
3. **Sélection de l'heure** (00:00 - 23:00)
4. **Choix de la durée** (1h, 1h30, 2h, etc.)
5. **Calcul automatique du prix**
6. **Sélection méthode de paiement**
7. **Rappel des conditions d'utilisation**
8. **Confirmation et paiement**

#### Statuts de Réservation
- **`en_attente`** : En attente de confirmation
- **`confirmee`** : Confirmée par le gestionnaire
- **`annulee`** : Annulée (client ou gestionnaire)
- **`terminee`** : Réservation terminée

#### Tickets QR
- ✅ **Génération automatique** : Code unique par réservation
- ✅ **QR Code** : Image QR code générée
- ✅ **Validation** : Scanner ou code manuel
- ✅ **Historique** : Traçabilité des validations

#### Politique de Remboursement
- **12h+ avant** : Remboursement complet de l'acompte
- **< 12h avant** : Perte de l'acompte
- **No-Show** : Pénalité supplémentaire (10 000 FCFA)

### 4. Module Abonnements

#### Types d'Abonnements
- **Mensuel** : 1 mois
- **Trimestriel** : 3 mois
- **Annuel** : 12 mois

#### Configuration
- **Jours par semaine** : Nombre de jours d'utilisation
- **Heures par jour** : Créneaux horaires
- **Prix réduit** : 20 000 FCFA/heure (au lieu du prix normal)

#### Paiement
- **Acompte** : 30% du montant total
- **Différé** : Paiement par session
- **Méthode** : Orange Money, Wave, Cash

### 5. Module Paiements

#### Méthodes de Paiement
- **Orange Money** : Intégration API Orange Money
- **Wave** : Intégration API Wave
- **Cash** : Paiement en espèces

#### Statuts
- **`pending`** : En attente
- **`completed`** : Complété
- **`failed`** : Échec
- **`refunded`** : Remboursé

#### Commissions
- **Taux par défaut** : 10%
- **Contrats personnalisés** : Par gestionnaire
- **Calcul automatique** : Sur chaque paiement
- **Reversement** : À l'application KSM

### 6. Module Avis et Notes

#### Fonctionnalités
- ✅ **Notation** : 1 à 5 étoiles
- ✅ **Commentaires** : Texte optionnel
- ✅ **Modération** : Approbation admin requise
- ✅ **Calcul moyenne** : Mise à jour automatique
- ✅ **Un seul avis** : Par utilisateur et par terrain
- ✅ **Condition** : Réservation terminée requise

### 7. Module Favoris

#### Fonctionnalités
- ✅ **Ajout/Retrait** : Toggle simple
- ✅ **Liste dédiée** : Page des favoris
- ✅ **Synchronisation** : Backend + Local
- ✅ **Accès rapide** : Depuis la carte

### 8. Module Support

#### Tickets de Support
- ✅ **Création** : Par les clients
- ✅ **Assignation** : Aux agents support
- ✅ **Statuts** : Ouvert, En cours, Résolu, Fermé
- ✅ **Priorités** : Haute, Moyenne, Basse
- ✅ **Réponses** : Conversation thread

#### Litiges
- ✅ **Création** : Par clients ou gestionnaires
- ✅ **Types** : Remboursement, Service, Autre
- ✅ **Résolution** : Par les admins
- ✅ **Historique** : Traçabilité complète

### 9. Module Notifications

#### Types de Notifications
- **Système** : Notifications internes
- **Email** : Notifications par email
- **SMS** : Notifications SMS (futur)
- **Push** : Notifications push (futur)

#### Templates
- ✅ **Personnalisables** : Par type de notification
- ✅ **Ciblage** : Par rôle ou utilisateur
- ✅ **Programmation** : Notifications différées

### 10. Module Analytics

#### Statistiques
- ✅ **Dashboard** : Vue d'ensemble
- ✅ **Revenus** : CA, commissions, à reverser
- ✅ **Utilisateurs** : Nouveaux, actifs, totaux
- ✅ **Réservations** : Par statut, par période
- ✅ **Terrains** : Taux d'occupation, revenus

#### Rapports
- ✅ **Financiers** : Revenus, commissions, remboursements
- ✅ **Utilisation** : Terrains les plus réservés
- ✅ **Exports** : CSV, Excel, PDF

---

## 📱 Applications et Interfaces

### 1. Backend API (Laravel)

**Localisation** : `Backend/`

**Contrôleurs API** (25+ contrôleurs) :
- `AuthController` : Authentification (OTP, PIN, login, register)
- `TerrainController` : Gestion des terrains
- `ReservationController` : Réservations
- `PaiementController` : Paiements
- `AbonnementController` : Abonnements
- `TicketController` : Tickets QR
- `AdminController` : Administration
- `GestionnaireController` : Gestionnaire
- `AvisController` : Avis et notes
- `FavoriteController` : Favoris
- `SupportController` : Support
- `LitigeController` : Litiges
- `NotificationController` : Notifications
- `AnalyticsController` : Analytics
- Et plus...

**Routes API** :
- `/api/auth/*` : Authentification
- `/api/terrains/*` : Terrains
- `/api/reservations/*` : Réservations
- `/api/paiements/*` : Paiements
- `/api/abonnements/*` : Abonnements
- `/api/admin/*` : Administration
- `/api/manager/*` : Gestionnaire
- `/api/favorites/*` : Favoris
- `/api/reviews/*` : Avis
- Et plus...

### 2. Frontend Web (React)

**Localisation** : `Frontend/`

**Pages Publiques** :
- `HomePage` : Page d'accueil
- `CataloguePage` : Catalogue des terrains
- `LoginPage` : Connexion
- `RegisterClientPage` : Inscription client
- `RegisterManagerPage` : Inscription gestionnaire
- `TermsPage` : Conditions d'utilisation
- `PrivacyPage` : Politique de confidentialité
- `ContactPage` : Contact

**Pages Client** :
- `ClientDashboardPage` : Dashboard client
- `MapPage` : Carte interactive
- `TerrainDetailPage` : Détails terrain
- `ReservationPage` : Réservation
- `ReservationsPage` : Mes réservations
- `ProfilePage` : Profil

**Pages Gestionnaire** :
- `ManagerDashboard` : Dashboard gestionnaire
- `ManagerTerrainsPage` : Mes terrains
- `ManagerReservationsPage` : Mes réservations
- `QrScannerPage` : Scanner QR
- `RevenuePage` : Revenus
- `ProfilePage` : Profil

**Pages Admin** (9 sections avec onglets) :
1. **AdminDashboard** : Tableau de bord
2. **ManagerValidationPage** : Validations
3. **ManageUsersPage** : Utilisateurs
4. **ManageTerrainsPage** : Terrains + Import Géo
5. **ReservationsPage** : Réservations + Abonnements
6. **FinancesPage** : Finances + Paiements + Commissions
7. **SupportPage** : Support + Litiges
8. **ReportsPage** : Rapports
9. **SettingsPage** : Configuration + Notifications + Logs

### 3. Application Mobile Client (Flutter)

**Localisation** : `mobile-client/`

**Écrans Principaux** :
- `PhoneAuthScreen` : Authentification téléphone
- `OtpVerificationScreen` : Vérification OTP
- `PinSetupScreen` : Création PIN
- `PinLoginScreen` : Connexion PIN
- `PersonalInfoScreen` : Informations personnelles
- `MapScreen` : Carte interactive avec recherche
- `TerrainDetailScreen` : Détails terrain
- `ReservationScreen` : Réservation
- `MyReservationsScreen` : Mes réservations
- `FavoritesScreen` : Favoris
- `ProfileScreen` : Profil
- `EditProfileScreen` : Édition profil
- `TermsScreen` : Conditions
- `PrivacyScreen` : Confidentialité
- `HelpScreen` : Aide
- `ReviewsListScreen` : Liste des avis
- `ReviewScreen` : Laisser un avis

**Navigation** :
- Bottom Navigation Bar avec 4 onglets : Carte, Réservations, Favoris, Profil

### 4. Application Mobile Gestionnaire (Flutter)

**Localisation** : `mobile-gestionnaire/`

**Écrans Principaux** :
- `LoginScreen` : Connexion
- `DashboardScreen` : Dashboard avec statistiques
- `ReservationsScreen` : Liste des réservations
- `QrScannerScreen` : Scanner QR code
- `RevenueScreen` : Revenus et statistiques
- `ProfileScreen` : Profil
- `EditProfileScreen` : Édition profil
- `HelpScreen` : Aide
- `AboutScreen` : À propos

**Navigation** :
- Bottom Navigation Bar avec 4 onglets : Dashboard, Réservations, Revenus, Profil

---

## 🗄️ Base de Données

### Tables Principales

#### Utilisateurs
- `users` : Utilisateurs (clients, gestionnaires, admins)
  - `id`, `nom`, `prenom`, `email`, `telephone`
  - `role` : client, gestionnaire, admin
  - `pin` : PIN hashé (4 chiffres)
  - `otp_code`, `otp_expires_at` : OTP temporaire
  - `statut_validation` : Pour gestionnaires
  - `nom_entreprise`, `numero_ninea`, `adresse_entreprise`

#### Terrains
- `terrains_synthetiques_dakar` : Terrains
  - `id`, `nom`, `adresse`, `description`
  - `latitude`, `longitude` : Coordonnées GPS
  - `geom` : Point PostGIS (centroïde)
  - `geom_polygon` : Polygone PostGIS (contour)
  - `surface_postgis`, `surface_calculee` : Surfaces calculées
  - `prix_heure`, `capacite_spectateurs`
  - `note_moyenne`, `nombre_avis`
  - `gestionnaire_id` : Référence au gestionnaire

#### Réservations
- `reservations` : Réservations
  - `id`, `terrain_synthetique_id`, `user_id`
  - `date_debut`, `date_fin`
  - `montant_total`, `duree_heures`
  - `statut` : en_attente, confirmee, annulee, terminee
  - `code_ticket` : Code unique pour QR
  - `ticket_validated` : Validation du ticket
  - `notes_admin` : Notes internes

#### Paiements
- `paiements` : Paiements
  - `id`, `reservation_id`, `user_id`
  - `montant`, `methode_paiement`
  - `statut` : pending, completed, failed, refunded
  - `commission` : Commission KSM
  - `date_paiement`

#### Abonnements
- `abonnements` : Abonnements
  - `id`, `type_abonnement_id`, `user_id`, `terrain_id`
  - `date_debut`, `date_fin`
  - `prix_total`, `acompte`
  - `preferences` : JSON (jours, heures)
  - `statut` : actif, expire, annule

#### Tickets
- `tickets` : Tickets QR
  - `id`, `reservation_id`
  - `code_ticket` : Code unique
  - `qr_code` : Image QR code
  - `validated_at` : Date de validation
  - `validated_by` : Gestionnaire qui a validé

#### Avis
- `avis_terrains` : Avis et notes
  - `id`, `user_id`, `terrain_id`, `reservation_id`
  - `note` : 1 à 5
  - `commentaire` : Texte optionnel
  - `est_approuve` : Modération admin

#### Favoris
- `favorites` : Favoris
  - `id`, `user_id`, `terrain_id`
  - `created_at`

#### Support
- `support_tickets` : Tickets de support
  - `id`, `user_id`, `sujet`, `message`
  - `statut` : ouvert, en_cours, resolu, ferme
  - `priorite` : haute, moyenne, basse

#### Litiges
- `litiges` : Litiges
  - `id`, `user_id`, `reservation_id`
  - `type`, `description`
  - `statut` : nouveau, en_cours, resolu, ferme

#### Commissions
- `contrats_commission` : Contrats de commission
  - `id`, `gestionnaire_id`
  - `taux_commission` : Pourcentage
  - `type_contrat` : global, par_terrain
  - `date_debut`, `date_fin`
  - `statut` : actif, suspendu, expire

### Relations

- `users` → `terrains_synthetiques_dakar` (gestionnaire)
- `users` → `reservations` (client)
- `reservations` → `paiements`
- `reservations` → `tickets`
- `users` → `avis_terrains`
- `users` → `favorites`
- `terrains_synthetiques_dakar` → `reservations`
- `terrains_synthetiques_dakar` → `avis_terrains`

---

## 🔌 API REST - Endpoints Complets

### Authentification (`/api/auth`)

```
POST   /api/auth/send-otp              # Envoyer OTP
POST   /api/auth/verify-otp            # Vérifier OTP
POST   /api/auth/set-pin                # Créer PIN
POST   /api/auth/register-phone         # Inscription complète
POST   /api/auth/login-phone            # Connexion avec OTP + PIN
POST   /api/auth/login-pin               # Connexion rapide avec PIN
POST   /api/auth/logout                  # Déconnexion
GET    /api/auth/profile                 # Profil utilisateur
PUT    /api/auth/update-profile          # Mettre à jour profil
POST   /api/auth/update-phone            # Mettre à jour téléphone (OTP)
```

### Terrains (`/api/terrains`)

```
GET    /api/terrains                    # Liste des terrains
GET    /api/terrains/{id}               # Détails d'un terrain
GET    /api/terrains/search              # Recherche de terrains
POST   /api/terrains                    # Créer un terrain (admin)
PUT    /api/terrains/{id}                # Modifier un terrain
DELETE /api/terrains/{id}                # Supprimer un terrain
POST   /api/terrains/import              # Import géomatique
```

### Réservations (`/api/reservations`)

```
GET    /api/reservations                 # Mes réservations
POST   /api/reservations                 # Créer une réservation
GET    /api/reservations/{id}            # Détails réservation
PUT    /api/reservations/{id}             # Modifier réservation
DELETE /api/reservations/{id}             # Annuler réservation
POST   /api/reservations/{id}/cancel      # Annulation avec remboursement
```

### Paiements (`/api/paiements`)

```
GET    /api/paiements                    # Mes paiements
POST   /api/paiements/reservation         # Paiement réservation
POST   /api/paiements/subscription        # Paiement abonnement
GET    /api/paiements/{id}                # Détails paiement
POST   /api/paiements/{id}/refund         # Remboursement
```

### Abonnements (`/api/abonnements`)

```
GET    /api/abonnements                  # Liste des abonnements
GET    /api/abonnements/{id}             # Détails abonnement
POST   /api/abonnements                  # Souscrire un abonnement
PUT    /api/abonnements/{id}              # Modifier abonnement
DELETE /api/abonnements/{id}              # Annuler abonnement
```

### Favoris (`/api/favorites`)

```
GET    /api/favorites                    # Mes favoris
POST   /api/favorites/terrain/{id}/toggle # Ajouter/retirer favori
GET    /api/favorites/terrain/{id}/check  # Vérifier si favori
DELETE /api/favorites/{id}                 # Supprimer favori
```

### Avis (`/api/reviews`)

```
GET    /api/reviews/terrain/{id}         # Avis d'un terrain
POST   /api/reviews                      # Créer un avis
PUT    /api/reviews/{id}                  # Modifier un avis
DELETE /api/reviews/{id}                  # Supprimer un avis
GET    /api/reviews/terrain/{id}/can-review # Vérifier si peut noter
GET    /api/reviews/terrain/{id}/my-review # Mon avis pour ce terrain
```

### Administration (`/api/admin`)

```
GET    /api/admin/dashboard-stats        # Statistiques dashboard
GET    /api/admin/users                  # Liste utilisateurs
POST   /api/admin/users                  # Créer utilisateur
PUT    /api/admin/users/{id}              # Modifier utilisateur
DELETE /api/admin/users/{id}              # Supprimer utilisateur
GET    /api/admin/terrains                # Liste terrains
POST   /api/admin/terrains                # Créer terrain
PUT    /api/admin/terrains/{id}           # Modifier terrain
DELETE /api/admin/terrains/{id}           # Supprimer terrain
GET    /api/admin/reservations            # Liste réservations
PUT    /api/admin/reservations/{id}/status # Modifier statut
GET    /api/admin/finances                # Finances
GET    /api/admin/payments                # Paiements
GET    /api/admin/commissions             # Commissions
GET    /api/admin/support                 # Tickets support
GET    /api/admin/disputes                # Litiges
GET    /api/admin/reports                 # Rapports
POST   /api/admin/notifications           # Envoyer notification
GET    /api/admin/logs                    # Logs système
GET    /api/admin/settings                # Paramètres
PUT    /api/admin/settings                # Mettre à jour paramètres
```

### Gestionnaire (`/api/manager`)

```
GET    /api/manager/dashboard             # Dashboard gestionnaire
GET    /api/manager/reservations          # Mes réservations
PUT    /api/manager/reservations/{id}/status # Modifier statut
GET    /api/manager/stats/revenue         # Statistiques revenus
POST   /api/manager/validate-ticket       # Valider ticket QR
```

---

## 🔐 Sécurité et Authentification

### Authentification

#### OTP (One-Time Password)
- **Génération** : 6 chiffres aléatoires
- **Expiration** : 5 minutes
- **Stockage** : Hashé dans la base de données
- **Envoi** : Log en développement, SMS en production

#### PIN (Personal Identification Number)
- **Format** : 4 chiffres
- **Stockage** : Hashé avec bcrypt
- **Validation** : Vérification du hash
- **Remember Device** : Stockage local du numéro de téléphone

#### Tokens Sanctum
- **Génération** : À la connexion
- **Expiration** : Configurable
- **Refresh** : Tokens de rafraîchissement
- **Révocation** : À la déconnexion

### Sécurité

#### Validation des Données
- **Form Requests** : Validation Laravel
- **Sanitization** : Nettoyage des entrées
- **Type Checking** : Vérification des types

#### Protection CSRF
- **Tokens CSRF** : Protection contre les attaques
- **Same-Site Cookies** : Protection supplémentaire

#### Rate Limiting
- **API** : Limite de requêtes par minute
- **Authentification** : Limite de tentatives
- **IP Based** : Limitation par IP

#### Hashing
- **Mots de passe** : bcrypt
- **PIN** : bcrypt
- **OTP** : Hash temporaire

---

## 🗺️ Gestion Géospatiale

### PostGIS

#### Fonctions Utilisées
- `ST_GeomFromKML()` : Import depuis KML
- `ST_GeomFromText()` : Création depuis WKT
- `ST_Area()` : Calcul de surface
- `ST_Transform()` : Transformation de système de coordonnées
- `ST_Centroid()` : Calcul du centroïde
- `ST_AsGeoJSON()` : Export GeoJSON
- `ST_Distance()` : Calcul de distance
- `ST_Within()` : Vérification d'inclusion

#### Système de Coordonnées
- **WGS84** : EPSG:4326 (GPS)
- **UTM Zone 28N** : EPSG:32628 (Calculs de surface)

### Import de Données

#### Formats Supportés
1. **KML/KMZ** : Google Earth
2. **Shapefile** : SHP, DBF, SHX, PRJ
3. **GeoJSON** : Format JSON géospatial
4. **CSV** : KoboCollect avec colonnes lat/lon

#### Processus d'Import
1. **Upload** : Téléchargement du fichier
2. **Parsing** : Extraction des géométries
3. **Validation** : Vérification de la validité
4. **Transformation** : Conversion au système de coordonnées
5. **Insertion** : Enregistrement dans PostGIS
6. **Calcul** : Surface et centroïde automatiques

---

## 🔄 Workflows et Processus

### Workflow de Réservation

```
1. Client recherche un terrain
   ↓
2. Client consulte les détails
   ↓
3. Client sélectionne date/heure/durée
   ↓
4. Système calcule le prix
   ↓
5. Client choisit méthode de paiement
   ↓
6. Client confirme (rappel conditions)
   ↓
7. Paiement de l'acompte
   ↓
8. Réservation créée (statut: en_attente)
   ↓
9. Gestionnaire confirme ou rejette
   ↓
10. Si confirmée → Ticket QR généré
   ↓
11. Client reçoit le ticket
   ↓
12. Le jour J → Gestionnaire scanne le QR
   ↓
13. Réservation validée → Statut: terminee
```

### Workflow d'Abonnement

```
1. Client consulte les abonnements
   ↓
2. Client sélectionne un type
   ↓
3. Client configure (jours, heures)
   ↓
4. Système calcule le prix total
   ↓
5. Client paie l'acompte (30%)
   ↓
6. Abonnement créé (statut: actif)
   ↓
7. Client peut réserver selon ses préférences
   ↓
8. Paiement par session (différé)
```

### Workflow de Validation Gestionnaire

```
1. Gestionnaire s'inscrit
   ↓
2. Statut: en_attente
   ↓
3. Admin consulte la demande
   ↓
4. Admin vérifie les documents
   ↓
5. Admin définit le taux de commission
   ↓
6. Admin approuve ou rejette
   ↓
7. Si approuvé → Statut: approuve
   ↓
8. Gestionnaire peut gérer ses terrains
```

---

## 🚀 Installation et Configuration

### Prérequis Système

#### Serveur
- **OS** : Linux (Ubuntu 20.04+), Windows (avec WSL), macOS
- **PHP** : 8.2 ou supérieur
- **Composer** : 2.0 ou supérieur
- **Node.js** : 18 ou supérieur
- **PostgreSQL** : 15 ou supérieur
- **PostGIS** : 3.0 ou supérieur
- **Redis** : 7.0 ou supérieur
- **Flutter** : 3.0 ou supérieur (pour mobile)

#### Extensions PHP Requises
- `pdo_pgsql` : Driver PostgreSQL
- `pgsql` : Extension PostgreSQL
- `gd` ou `imagick` : Traitement d'images
- `redis` : Extension Redis
- `curl` : Requêtes HTTP
- `mbstring` : Manipulation de chaînes
- `xml` : Parsing XML
- `zip` : Compression

### Installation Complète

#### 1. Backend

```bash
# Cloner le projet
cd Backend

# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans .env
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=terrains_synthetiques
# DB_USERNAME=postgres
# DB_PASSWORD=votre_mot_de_passe

# Créer la base de données PostGIS
createdb terrains_synthetiques
psql terrains_synthetiques -c "CREATE EXTENSION postgis;"

# Exécuter les migrations
php artisan migrate

# Charger les données initiales
php artisan db:seed

# Démarrer le serveur
php artisan serve
```

#### 2. Frontend Web

```bash
cd Frontend

# Installer les dépendances
npm install

# Configurer l'URL de l'API dans src/services/api.ts
# const BASE_URL = 'http://127.0.0.1:8000';

# Démarrer le serveur de développement
npm run dev

# Build pour production
npm run build
```

#### 3. Application Mobile Client

```bash
cd mobile-client

# Installer les dépendances
flutter pub get

# Configurer l'URL de l'API dans lib/services/api_service.dart
# static const String baseUrl = 'http://127.0.0.1:8000/api';

# Lancer sur Android
flutter run

# Lancer sur iOS
flutter run -d ios
```

#### 4. Application Mobile Gestionnaire

```bash
cd mobile-gestionnaire

# Installer les dépendances
flutter pub get

# Configurer l'URL de l'API dans lib/services/api_service.dart
# static const String baseUrl = 'http://127.0.0.1:8000/api';

# Lancer sur Android
flutter run

# Lancer sur iOS
flutter run -d ios
```

### Configuration PostGIS

```sql
-- Créer l'extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Vérifier l'installation
SELECT PostGIS_version();

-- Créer les colonnes géométriques
ALTER TABLE terrains_synthetiques_dakar 
ADD COLUMN IF NOT EXISTS geom GEOMETRY(Point, 4326);

ALTER TABLE terrains_synthetiques_dakar 
ADD COLUMN IF NOT EXISTS geom_polygon GEOMETRY(Polygon, 4326);

-- Créer les index spatiaux
CREATE INDEX IF NOT EXISTS idx_terrains_geom ON terrains_synthetiques_dakar USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_terrains_geom_polygon ON terrains_synthetiques_dakar USING GIST(geom_polygon);
```

---

## 📚 Documentation Technique

### Documentation Disponible

1. **`README.md`** : Description générale du projet
2. **`VERIFICATION_COMMUNICATION_API.md`** : Vérification API
3. **`VERIFICATION_INTERFACE_ADMIN.md`** : Vérification admin
4. **`FONCTIONNALITES_MANQUANTES.md`** : Fonctionnalités à venir
5. **`TEST_ADMIN_INTERFACE.md`** : Tests admin
6. **`SIMPLIFICATION_NAVIGATION_ADMIN.md`** : Simplification navigation
7. **`MEMOIRE_TERRAINS_SYNTHETIQUES.md`** : Mémoire académique

### Guides par Application

- **Backend** : Voir `Backend/README.md`
- **Frontend** : Voir `Frontend/README.md`
- **Mobile Client** : Voir `mobile-client/README.md`
- **Mobile Gestionnaire** : Voir `mobile-gestionnaire/README.md`

---

## 📊 Statistiques du Projet

### Code

- **Backend** : 55+ fichiers PHP
- **Frontend** : 142+ fichiers TSX/TS
- **Mobile Client** : 31+ fichiers Dart
- **Mobile Gestionnaire** : 20+ fichiers Dart
- **Total** : 250+ fichiers de code

### Fonctionnalités

- **Contrôleurs API** : 25+
- **Routes API** : 100+
- **Modèles Eloquent** : 20+
- **Migrations** : 30+
- **Pages Web** : 40+
- **Écrans Mobile** : 30+

### Base de Données

- **Tables** : 25+
- **Relations** : 50+
- **Index** : 30+
- **Fonctions PostGIS** : 10+

---

## ✅ État du Projet

### Fonctionnalités Implémentées ✅

- ✅ Authentification complète (OTP + PIN)
- ✅ Gestion des terrains (CRUD + PostGIS)
- ✅ Système de réservation complet
- ✅ Gestion financière (paiements, commissions)
- ✅ Applications mobiles (client + gestionnaire)
- ✅ Panel d'administration complet
- ✅ Système d'avis et notes
- ✅ Favoris
- ✅ Scanner QR code
- ✅ Cartographie interactive
- ✅ Support et litiges
- ✅ Analytics et rapports

### En Attente ⏸️

- ⏸️ Push notifications (reporté - SMS après hébergement)
- ⏸️ Génération PDF des tickets
- ⏸️ Chat/Messagerie
- ⏸️ Analytics avancés
- ⏸️ Intégration SMS réelle
- ⏸️ Intégration paiements mobiles (Orange Money, Wave)

---

## 🎯 Prochaines Étapes

### Court Terme
1. Tests automatisés
2. Optimisation des performances
3. Documentation API complète
4. Intégration SMS

### Moyen Terme
1. Push notifications
2. Chat/Messagerie
3. Analytics avancés
4. Génération PDF

### Long Terme
1. Application web progressive (PWA)
2. Intégration IA pour recommandations
3. Marketplace pour équipements
4. Extension à d'autres villes

---

## 👥 Équipe et Contribution

**Développement** : Équipe Kalel Sa Match  
**Date de création** : 2024  
**Dernière mise à jour** : Janvier 2025  
**Version** : 1.0.0

---

## 📄 Licence

Ce projet est propriétaire. Tous droits réservés à Kalel Sa Match.

---

## 📞 Contact et Support

**Email** : support@kalelsamatch.com  
**WhatsApp** : +221 XX XXX XX XX  
**Site Web** : https://kalelsamatch.com

---

**Kalel Sa Match** - *Votre partenaire pour la gestion de terrains synthétiques* 🏟️⚽

---

*Document généré le : 28 janvier 2025*  
*Version : 1.0.0*

