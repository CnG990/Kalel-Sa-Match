#!/bin/bash

# 🚀 Script de Déploiement - Terrains Synthétiques Dakar
# Usage: ./deploy.sh [production|staging]

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="terrains-synthetiques"
DOMAIN="votre-domaine.com"

echo -e "${BLUE}🚀 Déploiement Terrains Synthétiques Dakar${NC}"
echo -e "${BLUE}Environnement: ${ENVIRONMENT}${NC}"
echo ""

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier PHP
    if ! command -v php &> /dev/null; then
        log_error "PHP n'est pas installé"
        exit 1
    fi
    
    # Vérifier Composer
    if ! command -v composer &> /dev/null; then
        log_error "Composer n'est pas installé"
        exit 1
    fi
    
    log_success "Tous les prérequis sont installés"
}

# Nettoyer le projet
clean_project() {
    log_info "Nettoyage du projet..."
    
    # Supprimer les dossiers de développement
    rm -rf node_modules 2>/dev/null || true
    rm -rf Backend/vendor 2>/dev/null || true
    rm -rf Frontend/node_modules 2>/dev/null || true
    rm -rf Frontend/dist 2>/dev/null || true
    rm -rf Backend/storage/framework/cache/* 2>/dev/null || true
    rm -rf Backend/storage/framework/sessions/* 2>/dev/null || true
    rm -rf Backend/storage/framework/views/* 2>/dev/null || true
    
    log_success "Projet nettoyé"
}

# Installer les dépendances Backend
install_backend_dependencies() {
    log_info "Installation des dépendances Backend..."
    
    cd Backend
    
    # Installer Composer
    composer install --no-dev --optimize-autoloader --no-interaction
    
    # Copier le fichier d'environnement
    if [ ! -f .env ]; then
        cp .env.example .env
        log_warning "Fichier .env créé à partir de .env.example"
    fi
    
    # Générer la clé d'application si nécessaire
    if ! grep -q "APP_KEY=base64:" .env; then
        php artisan key:generate
        log_success "Clé d'application générée"
    fi
    
    cd ..
    log_success "Dépendances Backend installées"
}

# Installer les dépendances Frontend
install_frontend_dependencies() {
    log_info "Installation des dépendances Frontend..."
    
    cd Frontend
    
    # Installer npm
    npm install --silent
    
    # Build pour la production
    npm run build
    
    cd ..
    log_success "Dépendances Frontend installées et build terminé"
}

# Configurer la base de données
setup_database() {
    log_info "Configuration de la base de données..."
    
    cd Backend
    
    # Exécuter les migrations
    php artisan migrate --force
    
    # Exécuter les seeders
    php artisan db:seed --force
    
    cd ..
    log_success "Base de données configurée"
}

# Optimiser pour la production
optimize_for_production() {
    log_info "Optimisation pour la production..."
    
    cd Backend
    
    # Cache des configurations
    php artisan config:cache
    
    # Cache des routes
    php artisan route:cache
    
    # Cache des vues
    php artisan view:cache
    
    cd ..
    log_success "Application optimisée pour la production"
}

# Configurer les permissions
set_permissions() {
    log_info "Configuration des permissions..."
    
    # Permissions pour Laravel
    chmod -R 755 Backend/storage
    chmod -R 755 Backend/bootstrap/cache
    
    # Permissions pour les logs
    chmod -R 755 Backend/storage/logs
    
    log_success "Permissions configurées"
}

# Créer les fichiers de configuration serveur
create_server_configs() {
    log_info "Création des configurations serveur..."
    
    # Configuration Nginx
    cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    root /var/www/terrains-synthetiques/Backend/public;
    index index.php index.html;

    # Gestion des erreurs
    error_page 404 /index.php;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache statique
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP processing
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Sécurité
    location ~ /\.ht {
        deny all;
    }

    location ~ /\.env {
        deny all;
    }
}
EOF

    # Configuration Apache (.htaccess)
    cat > Backend/public/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
EOF

    log_success "Configurations serveur créées"
}

# Créer le script de sauvegarde
create_backup_script() {
    log_info "Création du script de sauvegarde..."
    
    cat > backup.sh << 'EOF'
#!/bin/bash

# Script de sauvegarde - Terrains Synthétiques Dakar
BACKUP_DIR="/var/backups/terrains-synthetiques"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
mysqldump -u root -p terrains_synthetiques > $BACKUP_DIR/db_backup_$DATE.sql

# Sauvegarde des fichiers
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/terrains-synthetiques

# Nettoyer les anciennes sauvegardes (garder 7 jours)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Sauvegarde terminée: $DATE"
EOF

    chmod +x backup.sh
    log_success "Script de sauvegarde créé"
}

# Créer le script de monitoring
create_monitoring_script() {
    log_info "Création du script de monitoring..."
    
    cat > monitor.sh << 'EOF'
#!/bin/bash

# Script de monitoring - Terrains Synthétiques Dakar

echo "=== MONITORING TERRAINS SYNTHÉTIQUES ==="
echo "Date: $(date)"
echo ""

# Vérifier les services
echo "=== SERVICES ==="
systemctl is-active nginx
systemctl is-active mysql
systemctl is-active php8.2-fpm

echo ""
echo "=== ESPACE DISQUE ==="
df -h

echo ""
echo "=== MÉMOIRE ==="
free -h

echo ""
echo "=== LOGS RÉCENTS ==="
tail -n 5 /var/log/nginx/error.log
EOF

    chmod +x monitor.sh
    log_success "Script de monitoring créé"
}

# Créer le fichier README de déploiement
create_deployment_readme() {
    log_info "Création du README de déploiement..."
    
    cat > DEPLOYMENT_README.md << 'EOF'
# 🚀 Guide de Déploiement - Terrains Synthétiques Dakar

## Configuration Post-Déploiement

### 1. Variables d'Environnement
Éditer le fichier `Backend/.env` :
```env
APP_NAME="Terrains Synthétiques Dakar"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-domaine.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=terrains_synthetiques
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

MAPBOX_TOKEN=your_mapbox_token
```

### 2. Configuration Serveur
- Copier `nginx.conf` vers `/etc/nginx/sites-available/`
- Activer le site : `ln -s /etc/nginx/sites-available/terrains-synthetiques /etc/nginx/sites-enabled/`
- Redémarrer Nginx : `systemctl restart nginx`

### 3. SSL/HTTPS
```bash
# Installer Certbot
apt install certbot python3-certbot-nginx

# Obtenir le certificat
certbot --nginx -d votre-domaine.com

# Renouvellement automatique
crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

### 4. Sauvegardes
Le script `backup.sh` est configuré pour :
- Sauvegarder la base de données quotidiennement
- Sauvegarder les fichiers
- Nettoyer les anciennes sauvegardes (7 jours)

### 5. Monitoring
Utiliser `monitor.sh` pour vérifier :
- Statut des services
- Utilisation des ressources
- Logs d'erreur

## Commandes Utiles

```bash
# Redémarrer les services
systemctl restart nginx mysql php8.2-fpm

# Voir les logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
tail -f Backend/storage/logs/laravel.log

# Mise à jour
cd /var/www/terrains-synthetiques
git pull
./deploy.sh production

# Sauvegarde manuelle
./backup.sh

# Monitoring
./monitor.sh
```

## Support
- Logs : `/var/log/nginx/` et `Backend/storage/logs/`
- Configuration : `Backend/.env` et `nginx.conf`
- Base de données : MySQL sur localhost:3306
EOF

    log_success "README de déploiement créé"
}

# Fonction principale
main() {
    echo -e "${BLUE}=== DÉPLOIEMENT TERRAINS SYNTHÉTIQUES DAKAR ===${NC}"
    echo ""
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Nettoyer le projet
    clean_project
    
    # Installer les dépendances
    install_backend_dependencies
    install_frontend_dependencies
    
    # Configurer la base de données
    setup_database
    
    # Optimiser pour la production
    optimize_for_production
    
    # Configurer les permissions
    set_permissions
    
    # Créer les configurations
    create_server_configs
    create_backup_script
    create_monitoring_script
    create_deployment_readme
    
    echo ""
    echo -e "${GREEN}✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !${NC}"
    echo ""
    echo -e "${BLUE}Prochaines étapes :${NC}"
    echo "1. Configurer le fichier Backend/.env"
    echo "2. Installer le certificat SSL"
    echo "3. Configurer les sauvegardes automatiques"
    echo "4. Tester toutes les fonctionnalités"
    echo ""
    echo -e "${YELLOW}Fichiers créés :${NC}"
    echo "- nginx.conf (configuration serveur)"
    echo "- backup.sh (sauvegardes automatiques)"
    echo "- monitor.sh (monitoring)"
    echo "- DEPLOYMENT_README.md (guide complet)"
    echo ""
    echo -e "${GREEN}🎉 Votre application est prête pour la production !${NC}"
}

# Exécuter le script
main "$@" 