#!/bin/bash
set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check for errors
check_error() {
    if [ $? -ne 0 ]; then
        log "❌ ERROR: $1"
        exit 1
    fi
}

log "🚀 Démarrage de l'application Laravel..."

# Change to Backend directory
cd /var/www/Backend

# Check if .env exists, if not copy from .env.example
if [ ! -f .env ]; then
    log "📄 Copie du fichier .env.example vers .env"
    cp .env.example .env
    check_error "Impossible de copier .env.example"
fi

# Generate application key if not set
if [ -z "$(grep '^APP_KEY=' .env | cut -d '=' -f2)" ] || [ "$(grep '^APP_KEY=' .env | cut -d '=' -f2)" = "" ]; then
    log "🔑 Génération de la clé d'application..."
    php artisan key:generate
    check_error "Impossible de générer la clé d'application"
fi

# Wait for database to be ready
log "⏳ Attente de la base de données..."
while ! php artisan tinker --execute="DB::connection()->getPdo();" 2>/dev/null; do
    log "⏳ Base de données non disponible, attente..."
    sleep 5
done
log "✅ Base de données disponible"

# Run migrations
log "🔄 Exécution des migrations..."
php artisan migrate --force
check_error "Échec des migrations"

# Seed database if needed
log "🌱 Exécution des seeders..."
php artisan db:seed --force
check_error "Échec des seeders"

# Clear and cache configuration
log "⚙️ Optimisation du cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage link
log "🔗 Création du lien de stockage..."
php artisan storage:link

# Set proper permissions
log "🔐 Configuration des permissions..."
chmod -R 755 storage bootstrap/cache

# Start the server
log "🌐 Démarrage du serveur Laravel..."
exec php artisan serve --host=0.0.0.0 --port=8000 