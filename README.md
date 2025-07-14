# Terrains-Synthetiques

Application web complète pour la gestion et la réservation de terrains de football synthétiques.

## 🚀 Fonctionnalités

### Frontend (React/TypeScript)
- Interface utilisateur moderne et responsive
- Système d'authentification complet
- Cartographie interactive des terrains
- Système de réservation en temps réel
- Gestion des abonnements
- Dashboard administrateur et gestionnaire
- Notifications en temps réel

### Backend (Laravel/PHP)
- API RESTful complète
- Authentification avec Sanctum
- Gestion des utilisateurs et rôles
- Système de réservation
- Gestion des abonnements
- Système de paiement
- Géolocalisation et cartographie
- Notifications push

## 🛠️ Technologies Utilisées

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- React Hot Toast
- Lucide React Icons
- Date-fns

### Backend
- Laravel 10
- PHP 8.1+
- MySQL/PostgreSQL
- Laravel Sanctum
- PostGIS (pour la géolocalisation)

## 📦 Installation

### Prérequis
- Node.js 18+
- PHP 8.1+
- Composer
- MySQL/PostgreSQL
- Git

### Installation du Frontend

```bash
cd Frontend
npm install
npm run dev
```

### Installation du Backend

```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

## 🔧 Configuration

1. Configurez votre fichier `.env` dans le dossier Backend
2. Configurez la base de données
3. Configurez les variables d'environnement pour les API

## 🚀 Démarrage Rapide

Utilisez les scripts de démarrage inclus :

```bash
# Windows
start-dev.bat

# PowerShell
start-dev.ps1
```

## 📁 Structure du Projet

```
Terrains-Synthetiques/
├── Frontend/                 # Application React
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   └── context/        # Contextes React
├── Backend/                 # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/ # Contrôleurs API
│   │   ├── Models/          # Modèles Eloquent
│   │   └── Services/        # Services métier
│   └── database/           # Migrations et seeders
└── kml/                    # Fichiers KML pour l'import
```

## 🔐 Authentification

Le système utilise Laravel Sanctum pour l'authentification avec des tokens JWT.

## 📊 Rôles Utilisateurs

- **Admin** : Accès complet à toutes les fonctionnalités
- **Gestionnaire** : Gestion des terrains et réservations
- **Utilisateur** : Réservation et consultation

## 🗺️ Cartographie

Intégration avec des cartes interactives pour la localisation et la sélection des terrains.

## 💳 Système de Paiement

Intégration avec Orange Money et autres systèmes de paiement locaux.

## 📱 Responsive Design

Interface adaptée pour mobile, tablette et desktop.

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- **Cheikh Ngom** - Développement initial

## 🙏 Remerciements

- Équipe de développement
- Utilisateurs beta testeurs
- Communauté open source 