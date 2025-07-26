#!/bin/bash

# Script de démarrage ultra-robuste pour Render
set -e  # Arrêter sur la première erreur

echo "🚀 Démarrage de l'application Laravel sur Render..."

# Fonction de log avec timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction de vérification d'erreur
check_error() {
    if [ $? -ne 0 ]; then
        log "❌ ERREUR: $1"
        exit 1
    fi
}

# Vérification de la structure du projet
log "📁 Vérification de la structure du projet..."
if [ ! -d "Backend" ]; then
    log "❌ Dossier Backend non trouvé"
    exit 1
fi

cd Backend
check_error "Impossible d'accéder au dossier Backend"

# Vérification des fichiers essentiels
log "🔍 Vérification des fichiers essentiels..."
if [ ! -f "composer.json" ]; then
    log "❌ composer.json non trouvé"
    exit 1
fi

if [ ! -f ".env" ] && [ ! -f ".env.example" ]; then
    log "❌ Fichier .env ou .env.example non trouvé"
    exit 1
fi

# Copie du fichier .env si nécessaire
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    log "📋 Copie du fichier .env.example vers .env"
    cp .env.example .env
    check_error "Impossible de copier .env.example"
fi

# Génération de la clé d'application si nécessaire
if ! grep -q "APP_KEY=base64:" .env; then
    log "🔑 Génération de la clé d'application..."
    php artisan key:generate --force
    check_error "Impossible de générer la clé d'application"
fi

# Vérification des variables d'environnement de base de données
log "🔍 Vérification des variables de base de données..."
if [ -z "$DATABASE_URL" ] && [ -z "$DB_HOST" ]; then
    log "⚠️ Variables de base de données non définies, utilisation des valeurs par défaut"
    # Utiliser des valeurs par défaut pour le développement
    export DB_CONNECTION=pgsql
    export DB_HOST=localhost
    export DB_PORT=5432
    export DB_DATABASE=laravel
    export DB_USERNAME=postgres
    export DB_PASSWORD=password
fi

# Attente intelligente de la base de données
log "⏳ Attente de la base de données..."
for i in {1..60}; do
    if php artisan tinker --execute="try { DB::connection()->getPdo(); echo 'OK'; exit(0); } catch (Exception \$e) { exit(1); }" > /dev/null 2>&1; then
        log "✅ Base de données accessible après $i tentatives"
        break
    fi
    
    if [ $i -eq 60 ]; then
        log "❌ Impossible de se connecter à la base de données après 60 tentatives"
        log "🔧 Tentative de démarrage sans base de données..."
        # Continuer sans base de données pour le moment
        break
    fi
    
    log "⏳ Tentative $i/60..."
    sleep 2
done

# Migration de la base de données avec gestion d'erreur robuste
log "🗄️ Migration de la base de données..."
if php artisan migrate --force > /dev/null 2>&1; then
    log "✅ Migration réussie"
else
    log "⚠️ Erreur lors de la migration, tentative de récupération..."
    if php artisan migrate:rollback --force > /dev/null 2>&1; then
        log "✅ Rollback réussi"
        if php artisan migrate --force > /dev/null 2>&1; then
            log "✅ Migration réussie après rollback"
        else
            log "⚠️ Migration échouée, continuation sans migration"
        fi
    else
        log "⚠️ Rollback échoué, continuation sans migration"
    fi
fi

# Seeding de la base de données (optionnel)
log "🌱 Seeding de la base de données..."
if php artisan db:seed --force > /dev/null 2>&1; then
    log "✅ Seeding réussi"
else
    log "⚠️ Seeding échoué, continuation..."
fi

# Optimisation de l'application
log "⚡ Optimisation de l'application..."
php artisan config:cache > /dev/null 2>&1 || log "⚠️ Cache config échoué"
php artisan route:cache > /dev/null 2>&1 || log "⚠️ Cache route échoué"
php artisan view:cache > /dev/null 2>&1 || log "⚠️ Cache view échoué"

# Création du lien symbolique pour le stockage
log "📁 Création du lien de stockage..."
if [ ! -L "public/storage" ]; then
    php artisan storage:link > /dev/null 2>&1 || log "⚠️ Lien storage échoué"
fi

# Vérification finale des permissions
log "🔐 Vérification des permissions..."
chmod -R 775 storage bootstrap/cache > /dev/null 2>&1 || log "⚠️ Permissions échouées"

# Démarrage du serveur avec gestion d'erreur
log "🌐 Démarrage du serveur Laravel..."
log "📍 URL: http://0.0.0.0:8000"
log "🎯 Application prête à recevoir des requêtes"

# Démarrer le serveur avec gestion d'erreur
exec php artisan serve --host=0.0.0.0 --port=8000 