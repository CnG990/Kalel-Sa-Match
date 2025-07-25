#!/bin/bash

# Script de démarrage pour Render
echo "🚀 Démarrage de l'application Laravel..."

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
sleep 30

# Vérifier la connexion à la base de données
echo "🔍 Vérification de la connexion à la base de données..."
php artisan tinker --execute="try { DB::connection()->getPdo(); echo '✅ Connexion à la base de données réussie'; } catch (Exception \$e) { echo '❌ Erreur de connexion: ' . \$e->getMessage(); exit(1); }"

# Migrer la base de données
echo "🗄️ Migration de la base de données..."
php artisan migrate --force

# Seeder la base de données
echo "🌱 Seeding de la base de données..."
php artisan db:seed --force

# Optimiser l'application
echo "⚡ Optimisation de l'application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Démarrer le serveur
echo "🌐 Démarrage du serveur..."
php artisan serve --host=0.0.0.0 --port=8000 