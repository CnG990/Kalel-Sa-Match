# 🔄 Guide de Migration DigitalOcean → OVH Cloud

> **Guide complet pour migrer l'application KSM de DigitalOcean vers OVH Cloud**

---

## 📋 Vue d'ensemble

Ce guide vous accompagne dans la migration de votre application KSM hébergée sur DigitalOcean vers OVH Cloud. La migration peut être effectuée avec un **downtime minimal** si bien planifiée.

**Durée estimée :** 4-8 heures (selon la taille des données)

---

## 🎯 Prérequis

### **Avant de commencer**

- [ ] Compte OVH Cloud créé et validé
- [ ] Accès SSH aux deux serveurs (DigitalOcean et OVH)
- [ ] Sauvegardes complètes de DigitalOcean
- [ ] Accès aux credentials de base de données
- [ ] Accès aux services externes (SMS, paiements, etc.)
- [ ] Fenêtre de maintenance planifiée (si nécessaire)

---

## 📦 Phase 1 : Préparation sur OVH Cloud

### **1.1 Créer l'infrastructure OVH**

#### **Créer une instance Public Cloud**

```bash
# Via le Manager OVH ou CLI
# Région recommandée : Gravelines (GRA)
# Instance : B2-7 (4 vCPU, 7GB RAM, 50GB SSD) minimum
```

**Configuration :**
- **OS** : Ubuntu 22.04 LTS
- **Région** : Gravelines (GRA) - France
- **Type** : B2-7 ou supérieur
- **Clé SSH** : Ajouter votre clé publique

#### **Créer une Managed Database PostgreSQL**

1. Accéder à **Public Cloud → Databases → PostgreSQL**
2. Créer une instance :
   - **Région** : Gravelines (GRA)
   - **Version** : PostgreSQL 15+ (avec PostGIS)
   - **Plan** : Starter (1GB RAM) minimum
3. **Activer PostGIS** :
   ```sql
   -- Se connecter à la base
   psql -h postgresql-xxxxx.db.cloud.ovh.net -U ksm_user -d ksm_db
   
   -- Activer PostGIS
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS postgis_topology;
   ```

#### **Créer un bucket Object Storage (optionnel)**

1. Accéder à **Public Cloud → Object Storage**
2. Créer un conteneur : `ksm-storage`
3. Générer les credentials (Access Key + Secret Key)

---

### **1.2 Configuration du serveur OVH**

#### **Installation des dépendances**

```bash
# Se connecter au serveur OVH
ssh ubuntu@<IP_OVH>

# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation des outils de base
sudo apt install -y \
    nginx \
    php8.2-fpm \
    php8.2-cli \
    php8.2-common \
    php8.2-mbstring \
    php8.2-xml \
    php8.2-curl \
    php8.2-zip \
    php8.2-gd \
    php8.2-pgsql \
    php8.2-redis \
    redis-server \
    postgresql-client \
    git \
    curl \
    unzip \
    certbot \
    python3-certbot-nginx

# Installation de Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Installation de Node.js (pour le build React)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### **Configuration du firewall**

```bash
# UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Vérifier
sudo ufw status
```

---

## 💾 Phase 2 : Sauvegarde depuis DigitalOcean

### **2.1 Sauvegarde de la base de données**

```bash
# Se connecter au serveur DigitalOcean
ssh ubuntu@<IP_DIGITALOCEAN>

# Sauvegarde complète de la base de données
pg_dump -h localhost -U ksm_user -d ksm_db -F c -f ksm_backup_$(date +%Y%m%d_%H%M%S).dump

# OU si Managed Database DigitalOcean
pg_dump -h <DB_HOST> -U ksm_user -d ksm_db -F c -f ksm_backup_$(date +%Y%m%d_%H%M%S).dump

# Vérifier la taille du fichier
ls -lh ksm_backup_*.dump
```

### **2.2 Sauvegarde des fichiers**

```bash
# Sauvegarder le backend Laravel
cd /var/www
tar -czf ksm-backend-backup_$(date +%Y%m%d_%H%M%S).tar.gz ksm-backend/

# Sauvegarder le frontend React (build)
tar -czf ksm-frontend-backup_$(date +%Y%m%d_%H%M%S).tar.gz ksm-frontend/

# Sauvegarder les fichiers uploadés (storage)
tar -czf ksm-storage-backup_$(date +%Y%m%d_%H%M%S).tar.gz ksm-storage/

# Vérifier les sauvegardes
ls -lh ksm-*-backup_*.tar.gz
```

### **2.3 Sauvegarde des configurations**

```bash
# Sauvegarder les configurations Nginx
sudo tar -czf nginx-config-backup.tar.gz /etc/nginx/sites-available/ksm

# Sauvegarder les certificats SSL (si nécessaire)
sudo tar -czf ssl-certs-backup.tar.gz /etc/letsencrypt/

# Sauvegarder le fichier .env (IMPORTANT)
cp /var/www/ksm-backend/.env /home/ubuntu/.env.backup
```

---

## 📤 Phase 3 : Transfert vers OVH Cloud

### **3.1 Transfert des fichiers**

#### **Option A : Via SCP (recommandé pour petits volumes)**

```bash
# Depuis votre machine locale
# Transfert du backend
scp ubuntu@<IP_DIGITALOCEAN>:/var/www/ksm-backend-backup_*.tar.gz ./
scp ksm-backend-backup_*.tar.gz ubuntu@<IP_OVH>:~/

# Transfert du frontend
scp ubuntu@<IP_DIGITALOCEAN>:/var/www/ksm-frontend-backup_*.tar.gz ./
scp ksm-frontend-backup_*.tar.gz ubuntu@<IP_OVH>:~/

# Transfert du storage
scp ubuntu@<IP_DIGITALOCEAN>:/var/www/ksm-storage-backup_*.tar.gz ./
scp ksm-storage-backup_*.tar.gz ubuntu@<IP_OVH>:~/
```

#### **Option B : Via rsync (recommandé pour gros volumes)**

```bash
# Transfert direct entre serveurs
# Depuis le serveur OVH
ssh ubuntu@<IP_OVH>

# Installer rsync si nécessaire
sudo apt install -y rsync

# Transfert du backend
rsync -avz --progress ubuntu@<IP_DIGITALOCEAN>:/var/www/ksm-backend/ /tmp/ksm-backend/

# Transfert du frontend
rsync -avz --progress ubuntu@<IP_DIGITALOCEAN>:/var/www/ksm-frontend/ /tmp/ksm-frontend/

# Transfert du storage
rsync -avz --progress ubuntu@<IP_DIGITALOCEAN>:/var/www/ksm-storage/ /tmp/ksm-storage/
```

### **3.2 Transfert de la base de données**

```bash
# Depuis votre machine locale ou le serveur DigitalOcean
# Transfert du dump
scp ubuntu@<IP_DIGITALOCEAN>:~/ksm_backup_*.dump ./
scp ksm_backup_*.dump ubuntu@<IP_OVH>:~/

# OU transfert direct
rsync -avz --progress ubuntu@<IP_DIGITALOCEAN>:~/ksm_backup_*.dump ubuntu@<IP_OVH>:~/
```

---

## 🔧 Phase 4 : Installation sur OVH Cloud

### **4.1 Restauration des fichiers**

```bash
# Se connecter au serveur OVH
ssh ubuntu@<IP_OVH>

# Créer les répertoires
sudo mkdir -p /var/www/ksm-backend
sudo mkdir -p /var/www/ksm-frontend
sudo mkdir -p /var/www/ksm-storage

# Restaurer le backend
cd /var/www
sudo tar -xzf ~/ksm-backend-backup_*.tar.gz -C /var/www/
sudo mv ksm-backend/* /var/www/ksm-backend/ || true

# Restaurer le frontend
sudo tar -xzf ~/ksm-frontend-backup_*.tar.gz -C /var/www/
sudo mv ksm-frontend/* /var/www/ksm-frontend/ || true

# Restaurer le storage
sudo tar -xzf ~/ksm-storage-backup_*.tar.gz -C /var/www/
sudo mv ksm-storage/* /var/www/ksm-storage/ || true

# Configurer les permissions
sudo chown -R www-data:www-data /var/www/ksm-backend
sudo chown -R www-data:www-data /var/www/ksm-frontend
sudo chown -R www-data:www-data /var/www/ksm-storage
sudo chmod -R 755 /var/www/ksm-backend/storage
sudo chmod -R 755 /var/www/ksm-backend/bootstrap/cache
```

### **4.2 Restauration de la base de données**

```bash
# Se connecter au serveur OVH
ssh ubuntu@<IP_OVH>

# Installer le client PostgreSQL si nécessaire
sudo apt install -y postgresql-client

# Restaurer la base de données
pg_restore -h <OVH_DB_HOST> -U ksm_user -d ksm_db -c -v ~/ksm_backup_*.dump

# Vérifier la restauration
psql -h <OVH_DB_HOST> -U ksm_user -d ksm_db -c "\dt"
psql -h <OVH_DB_HOST> -U ksm_user -d ksm_db -c "SELECT COUNT(*) FROM terrains;"
```

### **4.3 Configuration de l'application**

#### **Mettre à jour le fichier .env**

```bash
# Éditer le fichier .env
cd /var/www/ksm-backend
sudo nano .env
```

**Modifications à apporter :**

```env
# Ancien (DigitalOcean)
# DB_HOST=localhost
# DB_PORT=5432

# Nouveau (OVH)
APP_ENV=production
APP_DEBUG=false
APP_URL=https://ksm.sn

DB_CONNECTION=pgsql
DB_HOST=<OVH_DB_HOST>  # Ex: postgresql-xxxxx.db.cloud.ovh.net
DB_PORT=5432
DB_DATABASE=ksm_db
DB_USERNAME=ksm_user
DB_PASSWORD=<OVH_DB_PASSWORD>

# Redis (si local)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Storage (si OVH Object Storage)
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=<OVH_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<OVH_SECRET_KEY>
AWS_BUCKET=ksm-storage
AWS_ENDPOINT=https://s3.gra.io.cloud.ovh.net
AWS_REGION=gra
```

#### **Réinstaller les dépendances**

```bash
cd /var/www/ksm-backend

# Installer les dépendances PHP
composer install --no-dev --optimize-autoloader

# Optimiser Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Vérifier les migrations (ne pas exécuter si déjà restaurées)
php artisan migrate:status
```

#### **Rebuild du frontend**

```bash
cd /var/www/ksm-frontend

# Installer les dépendances
npm install

# Mettre à jour le .env.production
echo "VITE_API_URL=https://api.ksm.sn/api" > .env.production

# Build de production
npm run build

# Vérifier le build
ls -la dist/
```

---

## 🌐 Phase 5 : Configuration Nginx

### **5.1 Configuration Nginx pour OVH**

```bash
# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/ksm
```

**Contenu :**

```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ksm.sn www.ksm.sn;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ksm.sn www.ksm.sn;

    # SSL Certificate (Let's Encrypt - à installer)
    ssl_certificate /etc/letsencrypt/live/ksm.sn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ksm.sn/privkey.pem;

    # Frontend React
    root /var/www/ksm-frontend/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/ksm-access.log;
    error_log /var/log/nginx/ksm-error.log;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Storage (si local)
    location /storage {
        alias /var/www/ksm-storage/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### **5.2 Activer la configuration**

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/ksm /etc/nginx/sites-enabled/

# Supprimer la configuration par défaut
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### **5.3 Installation SSL (Let's Encrypt)**

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d ksm.sn -d www.ksm.sn

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
```

---

## 🚀 Phase 6 : Démarrage de l'application

### **6.1 Configuration PHP-FPM**

```bash
# Vérifier la configuration PHP-FPM
sudo systemctl status php8.2-fpm

# Démarrer PHP-FPM
sudo systemctl start php8.2-fpm
sudo systemctl enable php8.2-fpm
```

### **6.2 Démarrer Laravel**

```bash
# Option 1 : Via systemd (recommandé)
sudo nano /etc/systemd/system/ksm-backend.service
```

**Contenu :**

```ini
[Unit]
Description=KSM Laravel Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ksm-backend
ExecStart=/usr/bin/php artisan serve --host=127.0.0.1 --port=8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Activer et démarrer le service
sudo systemctl daemon-reload
sudo systemctl enable ksm-backend
sudo systemctl start ksm-backend
sudo systemctl status ksm-backend
```

### **6.3 Vérifications**

```bash
# Vérifier que tout fonctionne
curl http://127.0.0.1:8000/api/health
curl https://ksm.sn

# Vérifier les logs
sudo tail -f /var/www/ksm-backend/storage/logs/laravel.log
sudo tail -f /var/log/nginx/ksm-error.log
```

---

## 🔄 Phase 7 : Migration DNS (Downtime minimal)

### **7.1 Préparation DNS**

**Avant la migration :**
- Réduire le TTL des enregistrements DNS à 300 secondes (5 minutes)
- Noter les IP actuelles

### **7.2 Migration DNS**

1. **Se connecter à votre registrar DNS**
2. **Mettre à jour les enregistrements A :**
   ```
   Ancien : ksm.sn → <IP_DIGITALOCEAN>
   Nouveau : ksm.sn → <IP_OVH>
   
   Ancien : www.ksm.sn → <IP_DIGITALOCEAN>
   Nouveau : www.ksm.sn → <IP_OVH>
   ```
3. **Mettre à jour les enregistrements API (si séparé) :**
   ```
   api.ksm.sn → <IP_OVH>
   ```

### **7.3 Vérification DNS**

```bash
# Vérifier la propagation DNS
dig ksm.sn +short
nslookup ksm.sn

# Attendre la propagation (5-15 minutes avec TTL réduit)
```

---

## ✅ Phase 8 : Tests et Validation

### **8.1 Tests fonctionnels**

- [ ] **Frontend** : Accéder à https://ksm.sn
- [ ] **API** : Tester les endpoints API
- [ ] **Authentification** : Se connecter/déconnecter
- [ ] **Base de données** : Vérifier les données
- [ ] **Upload de fichiers** : Tester l'upload
- [ ] **Cartes** : Vérifier l'affichage des terrains
- [ ] **Paiements** : Tester les intégrations (mode test)
- [ ] **SMS** : Tester l'envoi de SMS
- [ ] **Emails** : Tester l'envoi d'emails

### **8.2 Tests de performance**

```bash
# Test de charge simple
ab -n 1000 -c 10 https://ksm.sn/

# Vérifier les métriques
htop
df -h
free -h
```

### **8.3 Monitoring**

- [ ] Configurer les alertes OVH
- [ ] Vérifier les logs
- [ ] Monitorer les performances

---

## 🔒 Phase 9 : Sécurité et Optimisation

### **9.1 Configuration Fail2Ban**

```bash
# Installer Fail2Ban
sudo apt install -y fail2ban

# Configuration de base
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Vérifier
sudo fail2ban-client status
```

### **9.2 Sauvegardes automatiques**

```bash
# Créer un script de sauvegarde
sudo nano /usr/local/bin/ksm-backup.sh
```

**Contenu :**

```bash
#!/bin/bash
BACKUP_DIR="/backups/ksm"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le répertoire
mkdir -p $BACKUP_DIR

# Sauvegarder la base de données
pg_dump -h <OVH_DB_HOST> -U ksm_user -d ksm_db -F c -f $BACKUP_DIR/db_$DATE.dump

# Sauvegarder les fichiers
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/ksm-storage

# Supprimer les sauvegardes de plus de 7 jours
find $BACKUP_DIR -type f -mtime +7 -delete
```

```bash
# Rendre exécutable
sudo chmod +x /usr/local/bin/ksm-backup.sh

# Ajouter au crontab (tous les jours à 2h du matin)
sudo crontab -e
# Ajouter :
0 2 * * * /usr/local/bin/ksm-backup.sh
```

---

## 🗑️ Phase 10 : Nettoyage (après validation)

### **10.1 Arrêter le serveur DigitalOcean**

⚠️ **ATTENTION : Ne supprimez PAS immédiatement !**

1. **Attendre 48-72 heures** après la migration
2. **Vérifier que tout fonctionne** sur OVH
3. **Vérifier les logs** pour détecter d'éventuels problèmes
4. **Faire une dernière sauvegarde** de DigitalOcean

### **10.2 Supprimer DigitalOcean**

```bash
# Dernière sauvegarde complète
# Puis supprimer via l'interface DigitalOcean
```

---

## 📊 Comparaison des configurations

| Élément | DigitalOcean | OVH Cloud |
|---------|--------------|-----------|
| **Instance** | Droplet 4GB | B2-7 (4 vCPU, 7GB) |
| **Base de données** | Managed DB ou local | Managed PostgreSQL |
| **Storage** | Spaces ou local | Object Storage ou local |
| **Latence Sénégal** | ~150-200ms | ~80-100ms |
| **Souveraineté** | USA | Europe (RGPD) |
| **Support** | Anglais | Français |

---

## 🆘 Dépannage

### **Problème : Base de données non accessible**

```bash
# Vérifier la connexion
psql -h <OVH_DB_HOST> -U ksm_user -d ksm_db

# Vérifier le firewall OVH
# Manager OVH → Database → Network → Autoriser l'IP du serveur
```

### **Problème : Erreurs 502 Bad Gateway**

```bash
# Vérifier PHP-FPM
sudo systemctl status php8.2-fpm
sudo tail -f /var/log/php8.2-fpm.log

# Vérifier Laravel
sudo systemctl status ksm-backend
sudo tail -f /var/www/ksm-backend/storage/logs/laravel.log
```

### **Problème : Fichiers non accessibles**

```bash
# Vérifier les permissions
sudo chown -R www-data:www-data /var/www/ksm-backend
sudo chmod -R 755 /var/www/ksm-backend/storage
```

---

## ✅ Checklist de Migration

### **Préparation**
- [ ] Compte OVH créé
- [ ] Instance OVH créée
- [ ] Managed Database créée
- [ ] PostGIS activé
- [ ] Object Storage créé (si nécessaire)

### **Sauvegarde**
- [ ] Base de données sauvegardée
- [ ] Fichiers backend sauvegardés
- [ ] Fichiers frontend sauvegardés
- [ ] Storage sauvegardé
- [ ] Configuration .env sauvegardée

### **Transfert**
- [ ] Fichiers transférés vers OVH
- [ ] Base de données transférée vers OVH
- [ ] Vérification de l'intégrité des fichiers

### **Installation**
- [ ] Fichiers restaurés
- [ ] Base de données restaurée
- [ ] Configuration .env mise à jour
- [ ] Dépendances installées
- [ ] Frontend rebuild

### **Configuration**
- [ ] Nginx configuré
- [ ] SSL installé
- [ ] PHP-FPM configuré
- [ ] Service Laravel démarré
- [ ] Firewall configuré

### **Tests**
- [ ] Tests fonctionnels passés
- [ ] Tests de performance OK
- [ ] Monitoring configuré

### **Migration DNS**
- [ ] TTL réduit
- [ ] DNS mis à jour
- [ ] Propagation vérifiée

### **Post-migration**
- [ ] Sauvegardes automatiques configurées
- [ ] Fail2Ban configuré
- [ ] Monitoring actif
- [ ] Documentation mise à jour

---

## 📚 Ressources

- [Documentation OVH Cloud](https://docs.ovh.com/fr/public-cloud/)
- [Guide PostgreSQL OVH](https://docs.ovh.com/fr/public-cloud/databases/)
- [Documentation Laravel Deployment](https://laravel.com/docs/deployment)

---

**Dernière mise à jour :** Janvier 2025

