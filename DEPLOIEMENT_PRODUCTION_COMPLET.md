# 🚀 Déploiement en Production - Guide Complet

## 📋 **Plan de Déploiement**

### **Phase 1 : Préparation du Serveur**
- ✅ Configuration du serveur web (Apache/Nginx)
- ✅ Installation de PHP 8.2+ et PostgreSQL
- ✅ Configuration de la base de données

### **Phase 2 : Déploiement de l'Application**
- ✅ Upload des fichiers Backend et Frontend
- ✅ Configuration des variables d'environnement
- ✅ Optimisation des performances

### **Phase 3 : Sécurité et SSL**
- 🔄 **Configuration SSL avec Certbot**
- 🔄 **Headers de sécurité**
- 🔄 **Protection contre les attaques**

### **Phase 4 : Monitoring et Maintenance**
- 🔄 **Surveillance des performances**
- 🔄 **Logs et alertes**
- 🔄 **Sauvegardes automatiques**

---

## 🔒 **Phase 3 : Configuration SSL/HTTPS**

### **3.1 Installation de Certbot**

#### **Ubuntu/Debian**
```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Certbot
sudo apt install certbot python3-certbot-apache -y

# Pour Nginx
sudo apt install certbot python3-certbot-nginx -y
```

#### **CentOS/RHEL**
```bash
# Installation EPEL
sudo yum install epel-release -y

# Installation Certbot
sudo yum install certbot python3-certbot-apache -y
```

### **3.2 Obtention du Certificat SSL**

#### **Apache**
```bash
# Obtenir le certificat
sudo certbot --apache -d votre-domaine.com -d www.votre-domaine.com

# Test du renouvellement
sudo certbot renew --dry-run
```

#### **Nginx**
```bash
# Obtenir le certificat
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Test du renouvellement
sudo certbot renew --dry-run
```

### **3.3 Configuration Automatique du Renouvellement**

```bash
# Éditer le crontab
sudo crontab -e

# Ajouter cette ligne pour le renouvellement automatique
0 12 * * * /usr/bin/certbot renew --quiet
```

### **3.4 Headers de Sécurité**

#### **Apache (.htaccess)**
```apache
# Headers de sécurité
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
</IfModule>

# Redirection HTTP vers HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

#### **Nginx**
```nginx
# Headers de sécurité
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;";

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 **Phase 4 : Monitoring et Surveillance**

### **4.1 Installation de Monitoring**

#### **Prometheus + Grafana**
```bash
# Installation de Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvf prometheus-*.tar.gz
cd prometheus-*

# Configuration Prometheus
cat > prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'laravel-app'
    static_configs:
      - targets: ['localhost:8000']
EOF

# Installation de Grafana
sudo apt install grafana -y
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

#### **Node Exporter (Métriques Système)**
```bash
# Installation Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvf node_exporter-*.tar.gz
sudo mv node_exporter-*/node_exporter /usr/local/bin/

# Service systemd
sudo tee /etc/systemd/system/node_exporter.service > /dev/null << EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
Type=simple
User=node_exporter
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

### **4.2 Scripts de Monitoring Laravel**

#### **Script de Vérification de Santé**
```bash
#!/bin/bash
# health_check.sh

APP_URL="https://votre-domaine.com"
LOG_FILE="/var/log/laravel-health.log"

# Vérifier la réponse HTTP
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)

if [ $HTTP_STATUS -eq 200 ]; then
    echo "$(date): ✅ Application OK - HTTP $HTTP_STATUS" >> $LOG_FILE
else
    echo "$(date): ❌ Application ERREUR - HTTP $HTTP_STATUS" >> $LOG_FILE
    # Envoyer une alerte
    echo "ALERTE: Application inaccessible" | mail -s "Alerte Application" admin@votre-domaine.com
fi

# Vérifier l'espace disque
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date): ⚠️ Espace disque critique: ${DISK_USAGE}%" >> $LOG_FILE
fi

# Vérifier la mémoire
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "$(date): ⚠️ Mémoire critique: ${MEMORY_USAGE}%" >> $LOG_FILE
fi
```

#### **Configuration Crontab pour Monitoring**
```bash
# Éditer le crontab
sudo crontab -e

# Ajouter ces lignes
*/5 * * * * /path/to/health_check.sh
0 * * * * /path/to/backup_script.sh
```

### **4.3 Logs et Alertes**

#### **Configuration des Logs Laravel**
```php
// config/logging.php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['daily', 'slack'],
    ],
    'daily' => [
        'driver' => 'daily',
        'path' => storage_path('logs/laravel.log'),
        'level' => env('LOG_LEVEL', 'debug'),
        'days' => 14,
    ],
    'slack' => [
        'driver' => 'slack',
        'url' => env('LOG_SLACK_WEBHOOK_URL'),
        'username' => 'Laravel Log',
        'emoji' => ':boom:',
        'level' => 'critical',
    ],
],
```

---

## 💾 **Phase 5 : Sauvegardes Automatiques**

### **5.1 Script de Sauvegarde Complète**

```bash
#!/bin/bash
# backup_complete.sh

# Configuration
BACKUP_DIR="/var/backups/laravel"
DB_NAME="kalel_sa_match"
DB_USER="kalel_user"
APP_DIR="/var/www/laravel"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Créer le dossier de sauvegarde
mkdir -p $BACKUP_DIR

echo "🔄 Début de la sauvegarde: $(date)"

# 1. Sauvegarde de la base de données
echo "📊 Sauvegarde de la base de données..."
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# 2. Sauvegarde des fichiers de l'application
echo "📁 Sauvegarde des fichiers..."
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# 3. Sauvegarde des uploads
echo "📤 Sauvegarde des uploads..."
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C $APP_DIR/storage/app/public .

# 4. Sauvegarde de la configuration
echo "⚙️ Sauvegarde de la configuration..."
cp $APP_DIR/.env $BACKUP_DIR/env_backup_$DATE

# 5. Créer un fichier de métadonnées
cat > $BACKUP_DIR/backup_info_$DATE.txt << EOF
Date: $(date)
Base de données: $DB_NAME
Application: $APP_DIR
Taille DB: $(du -h $BACKUP_DIR/db_backup_$DATE.sql | cut -f1)
Taille App: $(du -h $BACKUP_DIR/app_backup_$DATE.tar.gz | cut -f1)
Taille Uploads: $(du -h $BACKUP_DIR/uploads_backup_$DATE.tar.gz | cut -f1)
EOF

# 6. Nettoyer les anciennes sauvegardes
echo "🧹 Nettoyage des anciennes sauvegardes..."
find $BACKUP_DIR -name "*.sql" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.txt" -mtime +$RETENTION_DAYS -delete

# 7. Compresser tout en un seul fichier
echo "📦 Création de l'archive finale..."
cd $BACKUP_DIR
tar -czf complete_backup_$DATE.tar.gz db_backup_$DATE.sql app_backup_$DATE.tar.gz uploads_backup_$DATE.tar.gz env_backup_$DATE backup_info_$DATE.txt

# 8. Nettoyer les fichiers temporaires
rm db_backup_$DATE.sql app_backup_$DATE.tar.gz uploads_backup_$DATE.tar.gz env_backup_$DATE backup_info_$DATE.txt

echo "✅ Sauvegarde terminée: $(date)"
echo "📦 Archive créée: $BACKUP_DIR/complete_backup_$DATE.tar.gz"
```

### **5.2 Script de Restauration**

```bash
#!/bin/bash
# restore_backup.sh

# Configuration
BACKUP_DIR="/var/backups/laravel"
DB_NAME="kalel_sa_match"
DB_USER="kalel_user"
APP_DIR="/var/www/laravel"
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

echo "🔄 Début de la restauration: $(date)"

# 1. Extraire l'archive
echo "📦 Extraction de l'archive..."
cd $BACKUP_DIR
tar -xzf $BACKUP_FILE

# 2. Restaurer la base de données
echo "📊 Restauration de la base de données..."
psql -U $DB_USER -h localhost $DB_NAME < db_backup_*.sql

# 3. Restaurer les fichiers
echo "📁 Restauration des fichiers..."
tar -xzf app_backup_*.tar.gz -C $APP_DIR

# 4. Restaurer les uploads
echo "📤 Restauration des uploads..."
tar -xzf uploads_backup_*.tar.gz -C $APP_DIR/storage/app/public

# 5. Restaurer la configuration
echo "⚙️ Restauration de la configuration..."
cp env_backup_* $APP_DIR/.env

# 6. Nettoyer les caches
echo "🧹 Nettoyage des caches..."
cd $APP_DIR
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo "✅ Restauration terminée: $(date)"
```

### **5.3 Configuration Automatique des Sauvegardes**

```bash
# Éditer le crontab
sudo crontab -e

# Sauvegarde quotidienne à 2h du matin
0 2 * * * /path/to/backup_complete.sh

# Sauvegarde hebdomadaire complète le dimanche
0 3 * * 0 /path/to/backup_complete.sh --full

# Vérification des sauvegardes
0 4 * * * /path/to/verify_backups.sh
```

---

## 🔧 **Scripts de Déploiement Automatisé**

### **Script de Déploiement Complet**

```bash
#!/bin/bash
# deploy_production.sh

set -e

echo "🚀 Déploiement en production..."

# Configuration
APP_DIR="/var/www/laravel"
BACKUP_DIR="/var/backups/laravel"
GIT_REPO="https://github.com/CnG990/Kalel-Sa-Match.git"

# 1. Sauvegarde avant déploiement
echo "📦 Sauvegarde avant déploiement..."
/path/to/backup_complete.sh

# 2. Mise en mode maintenance
echo "🔧 Activation du mode maintenance..."
cd $APP_DIR
php artisan down --message="Déploiement en cours" --retry=60

# 3. Pull des dernières modifications
echo "📥 Récupération des dernières modifications..."
git pull origin master

# 4. Installation des dépendances
echo "📦 Installation des dépendances..."
composer install --no-dev --optimize-autoloader

# 5. Migrations et seeders
echo "🗄️ Mise à jour de la base de données..."
php artisan migrate --force
php artisan db:seed --force

# 6. Optimisations
echo "⚡ Optimisations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link

# 7. Build du frontend
echo "🏗️ Build du frontend..."
cd $APP_DIR/Frontend
npm install
npm run build

# 8. Permissions
echo "🔐 Configuration des permissions..."
chown -R www-data:www-data $APP_DIR/storage
chown -R www-data:www-data $APP_DIR/bootstrap/cache
chmod -R 775 $APP_DIR/storage
chmod -R 775 $APP_DIR/bootstrap/cache

# 9. Désactivation du mode maintenance
echo "✅ Désactivation du mode maintenance..."
cd $APP_DIR
php artisan up

echo "🎉 Déploiement terminé avec succès!"
```

---

## 📋 **Checklist de Déploiement**

### **✅ Prérequis**
- [ ] Serveur configuré (Apache/Nginx)
- [ ] PHP 8.2+ installé
- [ ] PostgreSQL installé
- [ ] SSL configuré
- [ ] Domaines pointés vers le serveur

### **✅ Application**
- [ ] Code déployé
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Frontend buildé
- [ ] Permissions correctes

### **✅ Sécurité**
- [ ] SSL/HTTPS actif
- [ ] Headers de sécurité configurés
- [ ] Firewall configuré
- [ ] Logs de sécurité activés

### **✅ Monitoring**
- [ ] Prometheus installé
- [ ] Grafana configuré
- [ ] Alertes configurées
- [ ] Logs centralisés

### **✅ Sauvegardes**
- [ ] Scripts de sauvegarde créés
- [ ] Automatisation configurée
- [ ] Tests de restauration effectués
- [ ] Rétention configurée

---

## 🎯 **Commandes de Test Finales**

```bash
# Test de l'application
curl -I https://votre-domaine.com

# Test de l'API
curl -I https://votre-domaine.com/api/status

# Test SSL
curl -I https://votre-domaine.com

# Test des performances
ab -n 1000 -c 10 https://votre-domaine.com/

# Test de sauvegarde
/path/to/backup_complete.sh

# Test de restauration
/path/to/restore_backup.sh latest_backup.tar.gz
```

---

## 🎉 **Félicitations !**

Votre application **Kalél Sa Match** est maintenant :

- ✅ **Déployée en production**
- ✅ **Sécurisée avec SSL**
- ✅ **Surveillée et monitorée**
- ✅ **Sauvegardée automatiquement**
- ✅ **Prête pour les utilisateurs**

**🚀 Votre application est maintenant 100% opérationnelle en production !** 