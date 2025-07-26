# Dockerfile optimisé pour Laravel dans le dossier Backend
FROM php:8.2-fpm

# Variables d'environnement pour éviter les erreurs
ENV DEBIAN_FRONTEND=noninteractive
ENV COMPOSER_ALLOW_SUPERUSER=1

# Installation des dépendances système avec gestion d'erreur
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    wget \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libpq-dev \
    postgresql-client \
    supervisor \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Installation des extensions PHP avec vérification
RUN docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip

# Installation de Composer avec vérification
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer --version

# Définition du répertoire de travail
WORKDIR /var/www

# Copie du script de démarrage depuis la racine
COPY start.sh /var/www/start.sh
RUN chmod +x /var/www/start.sh

# Copie du dossier Backend
COPY Backend/ /var/www/Backend/

# Vérification de la présence des fichiers essentiels
RUN if [ ! -f "Backend/composer.json" ]; then \
        echo "❌ Erreur: composer.json non trouvé dans Backend/" && exit 1; \
    fi

# Déplacement dans le dossier Backend
WORKDIR /var/www/Backend

# Installation des dépendances PHP avec gestion d'erreur
RUN composer install --no-dev --optimize-autoloader --no-interaction || \
    (echo "⚠️ Erreur Composer, tentative de récupération..." && \
     composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs)

# Configuration des permissions de manière robuste
RUN chown -R www-data:www-data /var/www/Backend \
    && chmod -R 755 /var/www/Backend \
    && chmod -R 775 /var/www/Backend/storage \
    && chmod -R 775 /var/www/Backend/bootstrap/cache

# Création des dossiers nécessaires s'ils n'existent pas
RUN mkdir -p /var/www/Backend/storage/logs \
    && mkdir -p /var/www/Backend/storage/framework/cache \
    && mkdir -p /var/www/Backend/storage/framework/sessions \
    && mkdir -p /var/www/Backend/storage/framework/views \
    && mkdir -p /var/www/Backend/bootstrap/cache

# Retour à la racine pour le script de démarrage
WORKDIR /var/www

# Exposition du port
EXPOSE 8000

# Commande de démarrage avec gestion d'erreur
CMD ["/bin/bash", "-c", "cd /var/www && ./start.sh"] 