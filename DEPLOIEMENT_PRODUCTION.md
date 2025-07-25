# 🚀 Guide de Déploiement en Production

## 📋 Vue d'ensemble

Ce guide vous accompagne pour déployer l'application **Kalél Sa Match** en production.

### 🏗️ Architecture
- **Backend** : Laravel 12 + PostgreSQL + PostGIS
- **Frontend** : React + TypeScript + Vite
- **Base de données** : PostgreSQL avec extension PostGIS
- **Serveur web** : Apache/Nginx

---

## 🎯 Étapes de Déploiement

### 1. Préparation du Projet ✅

Le projet a été nettoyé et poussé sur GitHub :
- ✅ Fichiers de développement supprimés
- ✅ Caches nettoyés
- ✅ Tests supprimés
- ✅ Projet poussé sur GitHub

### 2. Déploiement du Backend

#### Option A : Déploiement Automatique
```powershell
# Exécuter le script de déploiement
.\deploy-backend-production.ps1
```

#### Option B : Déploiement Manuel

##### 2.1 Prérequis
- PHP 8.2+
- Composer
- PostgreSQL 13+
- Extension PostGIS
- Serveur web (Apache/Nginx)

##### 2.2 Installation
```bash
# Cloner le projet
git clone https://github.com/CnG990/Kalel-Sa-Match.git
cd Kalel-Sa-Match/Backend

# Installer les dépendances
composer install --no-dev --optimize-autoloader

# Configuration
cp .env.example .env
php artisan key:generate

# Base de données
php artisan migrate --force
php artisan db:seed --force

# Optimisation
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

##### 2.3 Configuration Serveur

**Apache (.htaccess)**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]

# Sécurité
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Cache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Headers de sécurité
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

**Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/project/public;
    index index.php index.html index.htm;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 3. Configuration de la Base de Données

#### 3.1 PostgreSQL + PostGIS
```sql
-- Créer la base de données
CREATE DATABASE kalel_sa_match;

-- Activer PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Créer l'utilisateur
CREATE USER kalel_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kalel_sa_match TO kalel_user;
```

#### 3.2 Variables d'Environnement (.env)
```env
APP_NAME="Kalél Sa Match"
APP_ENV=production
APP_KEY=base64:your_generated_key
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=kalel_sa_match
DB_USERNAME=kalel_user
DB_PASSWORD=your_password

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"
```

### 4. Déploiement du Frontend

#### 4.1 Build de Production
```bash
cd Frontend
npm install
npm run build
```

#### 4.2 Configuration du Serveur Web
- Copier le contenu du dossier `dist/` vers le répertoire web
- Configurer les routes pour le SPA React

### 5. Configuration SSL/HTTPS

#### 5.1 Certbot (Let's Encrypt)
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-apache

# Obtenir le certificat
sudo certbot --apache -d your-domain.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. Monitoring et Maintenance

#### 6.1 Scripts de Maintenance
```powershell
# Mode maintenance
.\maintenance-backend.ps1 on

# Désactiver le mode maintenance
.\maintenance-backend.ps1 off
```

#### 6.2 Logs et Monitoring
- **Logs Laravel** : `storage/logs/laravel.log`
- **Logs serveur** : `/var/log/apache2/` ou `/var/log/nginx/`
- **Monitoring** : Configurer un service comme New Relic ou DataDog

---

## 🔧 Scripts Utiles

### Démarrage Rapide Backend
```batch
# Windows
start-backend.bat

# Linux/Mac
php artisan serve --host=0.0.0.0 --port=8000
```

### Maintenance
```powershell
# Activer le mode maintenance
php artisan down --message="Maintenance en cours" --retry=60

# Désactiver le mode maintenance
php artisan up
```

### Sauvegarde Base de Données
```bash
# Sauvegarde
pg_dump kalel_sa_match > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
psql kalel_sa_match < backup_file.sql
```

---

## 🚨 Sécurité

### 1. Fichiers Sensibles
- ✅ `.env` protégé par `.htaccess`
- ✅ `storage/` et `bootstrap/cache/` avec permissions appropriées
- ✅ Headers de sécurité configurés

### 2. Base de Données
- ✅ Utilisateur dédié avec privilèges limités
- ✅ Connexion sécurisée (SSL si possible)
- ✅ Sauvegardes régulières

### 3. Serveur Web
- ✅ Headers de sécurité
- ✅ Compression activée
- ✅ Cache configuré
- ✅ SSL/HTTPS obligatoire

---

## 📊 Performance

### Optimisations Laravel
- ✅ Configuration mise en cache
- ✅ Routes mises en cache
- ✅ Vues mises en cache
- ✅ Autoloader optimisé

### Optimisations Serveur
- ✅ Compression gzip
- ✅ Cache navigateur
- ✅ Headers de sécurité
- ✅ SSL/HTTPS

---

## 🆘 Support

### Problèmes Courants

#### 1. Erreur 500
```bash
# Vérifier les logs
tail -f storage/logs/laravel.log

# Vérifier les permissions
chmod -R 775 storage bootstrap/cache
```

#### 2. Erreur de Base de Données
```bash
# Vérifier la connexion
php artisan tinker
DB::connection()->getPdo();

# Vérifier les migrations
php artisan migrate:status
```

#### 3. Problèmes de Cache
```bash
# Nettoyer tous les caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

## ✅ Checklist de Déploiement

- [ ] Backend Laravel déployé
- [ ] Base de données PostgreSQL configurée
- [ ] Extension PostGIS activée
- [ ] Variables d'environnement configurées
- [ ] SSL/HTTPS configuré
- [ ] Frontend React buildé et déployé
- [ ] Monitoring configuré
- [ ] Sauvegardes automatisées
- [ ] Tests de fonctionnalité effectués

---

## 🎉 Félicitations !

Votre application **Kalél Sa Match** est maintenant déployée en production !

**URL de production** : https://your-domain.com
**Support** : contact@your-domain.com 