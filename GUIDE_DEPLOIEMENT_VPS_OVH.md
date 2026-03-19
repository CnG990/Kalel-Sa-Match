# 🚀 Guide de Déploiement - VPS OVH (Version Économique)

## 📋 Configuration Cible

**VPS OVH** :
- **Type** : VPS Starter ou VPS Value
- **RAM** : 4-8 GB
- **vCPU** : 2-4 vCore
- **Stockage** : 75-160 GB SSD
- **Coût** : ~5-10 €/mois (~3,200-6,500 FCFA/mois)

**Architecture** :
- Laravel Backend
- React Frontend (build)
- PostgreSQL + PostGIS (local)
- Nginx (reverse proxy)

---

## ✅ Checklist de Préparation

- [ ] Compte OVH créé
- [ ] VPS commandé
- [ ] Accès SSH configuré
- [ ] Domaine configuré (optionnel)
- [ ] Certificat SSL (Let's Encrypt)

---

## Étape 1 : Commandé le VPS OVH

1. Aller sur [OVH.com](https://www.ovh.com)
2. **VPS** > **Commander un VPS**
3. Choisir **VPS Starter** ou **VPS Value**
4. Configuration recommandée :
   - **RAM** : 4-8 GB
   - **vCPU** : 2-4
   - **Stockage** : 75-160 GB SSD
   - **OS** : Ubuntu 22.04 LTS
5. Commander et attendre la création (5-10 minutes)

---

## Étape 2 : Configuration Initiale du Serveur

### 2.1 Connexion SSH

```bash
ssh root@votre-ip-vps
# OU
ssh root@votre-domaine.com
```

### 2.2 Mise à Jour du Système

```bash
apt update && apt upgrade -y
```

### 2.3 Créer un Utilisateur (Recommandé)

```bash
adduser laravel
usermod -aG sudo laravel
su - laravel
```

---

## Étape 3 : Installation des Dépendances

### 3.1 Installation de PHP 8.2

```bash
apt install -y software-properties-common
add-apt-repository ppa:ondrej/php -y
apt update
apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-common \
    php8.2-mysql php8.2-pgsql php8.2-zip php8.2-gd \
    php8.2-mbstring php8.2-curl php8.2-xml php8.2-bcmath \
    php8.2-intl php8.2-redis
```

### 3.2 Installation de Composer

```bash
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer
```

### 3.3 Installation de PostgreSQL + PostGIS

```bash
apt install -y postgresql postgresql-contrib
apt install -y postgis postgresql-14-postgis-3
```

### 3.4 Installation de Nginx

```bash
apt install -y nginx
```

### 3.5 Installation de Node.js (pour build React)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### 3.6 Installation de Redis (optionnel, pour cache)

```bash
apt install -y redis-server
```

---

## Étape 4 : Configuration PostgreSQL + PostGIS

### 4.1 Créer la Base de Données

```bash
sudo -u postgres psql
```

Dans PostgreSQL :
```sql
CREATE DATABASE terrains_db;
CREATE USER laravel_user WITH PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE terrains_db TO laravel_user;
\c terrains_db
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

### 4.2 Configurer l'Accès

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Ajouter/modifier :
```
host    terrains_db    laravel_user    127.0.0.1/32    md5
```

Redémarrer PostgreSQL :
```bash
systemctl restart postgresql
```

---

## Étape 5 : Déploiement de Laravel

### 5.1 Cloner le Projet

```bash
cd /var/www
git clone https://github.com/votre-repo/terrains-synthetiques.git
cd terrains-synthetiques/Backend
```

### 5.2 Installation des Dépendances

```bash
composer install --no-dev --optimize-autoloader
```

### 5.3 Configuration

```bash
cp .env.example .env
php artisan key:generate
nano .env
```

Configuration `.env` :
```env
APP_NAME="Terrains Synthetiques"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://votre-domaine.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=terrains_db
DB_USERNAME=laravel_user
DB_PASSWORD=votre_mot_de_passe_securise

FRONTEND_URL=https://votre-domaine.com
FRONTEND_URL_PROD=https://votre-domaine.com

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 5.4 Migrations et Permissions

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

---

## Étape 6 : Build et Déploiement du Frontend

### 6.1 Build React

```bash
cd /var/www/terrains-synthetiques/Frontend
npm install
npm run build
```

### 6.2 Copier les Fichiers Build

```bash
cp -r dist/* /var/www/html/
# OU créer un dossier dédié
mkdir -p /var/www/frontend
cp -r dist/* /var/www/frontend/
```

---

## Étape 7 : Configuration Nginx

### 7.1 Configuration Backend (API)

```bash
nano /etc/nginx/sites-available/terrains-api
```

Contenu :
```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;
    root /var/www/terrains-synthetiques/Backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 7.2 Configuration Frontend

```bash
nano /etc/nginx/sites-available/terrains-frontend
```

Contenu :
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    root /var/www/frontend;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7.3 Activer les Sites

```bash
ln -s /etc/nginx/sites-available/terrains-api /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/terrains-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Étape 8 : Configuration SSL (Let's Encrypt)

### 8.1 Installation de Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 8.2 Obtenir les Certificats

```bash
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
certbot --nginx -d api.votre-domaine.com
```

### 8.3 Renouvellement Automatique

```bash
certbot renew --dry-run
# Le renouvellement est automatique via cron
```

---

## Étape 9 : Configuration du Queue Worker

### 9.1 Créer un Service Systemd

```bash
nano /etc/systemd/system/terrains-queue.service
```

Contenu :
```ini
[Unit]
Description=Terrains Synthetiques Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/terrains-synthetiques/Backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600

[Install]
WantedBy=multi-user.target
```

### 9.2 Activer le Service

```bash
systemctl daemon-reload
systemctl enable terrains-queue
systemctl start terrains-queue
```

---

## Étape 10 : Configuration des Sauvegardes

### 10.1 Script de Sauvegarde

```bash
nano /usr/local/bin/backup-terrains.sh
```

Contenu :
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/terrains"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="terrains_db"
DB_USER="laravel_user"

mkdir -p $BACKUP_DIR

# Sauvegarde base de données
PGPASSWORD='votre_mot_de_passe' pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Sauvegarde fichiers
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/terrains-synthetiques/Backend/storage

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -type f -mtime +7 -delete
```

### 10.2 Rendre Exécutable

```bash
chmod +x /usr/local/bin/backup-terrains.sh
```

### 10.3 Cron Quotidien

```bash
crontab -e
```

Ajouter :
```
0 2 * * * /usr/local/bin/backup-terrains.sh
```

---

## Étape 11 : Configuration du Firewall

### 11.1 UFW (Uncomplicated Firewall)

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

---

## Étape 12 : Monitoring et Logs

### 12.1 Vérifier les Services

```bash
systemctl status nginx
systemctl status php8.2-fpm
systemctl status postgresql
systemctl status terrains-queue
systemctl status redis
```

### 12.2 Logs Laravel

```bash
tail -f /var/www/terrains-synthetiques/Backend/storage/logs/laravel.log
```

### 12.3 Logs Nginx

```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## ✅ Checklist de Déploiement

- [ ] VPS commandé et configuré
- [ ] PHP 8.2 installé
- [ ] PostgreSQL + PostGIS installé et configuré
- [ ] Base de données créée
- [ ] Laravel déployé
- [ ] Frontend buildé et déployé
- [ ] Nginx configuré
- [ ] SSL configuré (Let's Encrypt)
- [ ] Queue worker configuré
- [ ] Sauvegardes automatiques configurées
- [ ] Firewall configuré
- [ ] Services démarrés et fonctionnels

---

## 🔧 Maintenance

### Mise à Jour de l'Application

```bash
cd /var/www/terrains-synthetiques/Backend
git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Redémarrer les Services

```bash
systemctl restart php8.2-fpm
systemctl restart nginx
systemctl restart terrains-queue
```

---

## 💰 Coûts Estimés

- **VPS OVH** : ~5-10 €/mois
- **Domaine** : ~10-15 €/an (optionnel)
- **Total** : **~5-10 €/mois** (~3,200-6,500 FCFA/mois)

---

## 🆘 Problèmes Courants

### Erreur 502 Bad Gateway

```bash
# Vérifier PHP-FPM
systemctl status php8.2-fpm
# Redémarrer si nécessaire
systemctl restart php8.2-fpm
```

### Erreur de Permissions

```bash
chown -R www-data:www-data /var/www/terrains-synthetiques/Backend/storage
chmod -R 775 /var/www/terrains-synthetiques/Backend/storage
```

### Base de Données Non Accessible

```bash
# Vérifier PostgreSQL
systemctl status postgresql
# Vérifier la connexion
sudo -u postgres psql -c "SELECT version();"
```

---

**Votre application est maintenant déployée sur VPS OVH ! 🚀**

