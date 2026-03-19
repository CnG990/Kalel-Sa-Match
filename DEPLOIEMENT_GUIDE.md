# 🚀 Guide de Déploiement - Kalel Sa Match

## 📋 Table des Matières
1. [Prérequis](#prérequis)
2. [Infrastructure AWS](#infrastructure-aws)
3. [Déploiement Backend](#déploiement-backend)
4. [Déploiement Frontend](#déploiement-frontend)
5. [Configuration Nginx](#configuration-nginx)
6. [Tests & Vérification](#tests--vérification)
7. [Maintenance](#maintenance)

---

## 🔧 Prérequis

### Infrastructure Existante
- ✅ **EC2 Instance** - Backend Django
- ✅ **RDS PostgreSQL** - Base de données (`ksm.cr8qe06yq39x.af-south-1.rds.amazonaws.com`)
- ✅ **DuckDNS** - Nom de domaine (`kalelsamatch.duckdns.org`)
- ✅ **Nginx** - Reverse proxy configuré
- ✅ **Certificat SSL** - Let's Encrypt/Certbot

### Accès Requis
- Compte GitHub avec repo `CnG990/Kalel-Sa-Match`
- AWS Session Manager pour EC2
- Credentials RDS (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD)

---

## 🗄️ Infrastructure AWS

### RDS PostgreSQL
```
Endpoint: ksm.cr8qe06yq39x.af-south-1.rds.amazonaws.com
Port: 5432
Database: ksm
SSL: Required
```

### EC2 Backend
```
Path: /home/ssm-user/projects/ksm/python-backend
User: ssm-user
Python: 3.x
Venv: .venv
```

---

## 🐍 Déploiement Backend

### 1. Connexion EC2 (Session Manager)
```bash
# Via AWS Console → EC2 → Connect → Session Manager
# ou AWS CLI
aws ssm start-session --target <instance-id>
```

### 2. Première Installation

```bash
# Accéder au répertoire projet
cd /home/ssm-user/projects/ksm

# Cloner le repo GitHub
git clone https://github.com/CnG990/Kalel-Sa-Match.git python-backend
cd python-backend

# Créer environnement virtuel
python3 -m venv .venv
source .venv/bin/activate

# Installer dépendances
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configuration Environnement

Créer fichier `.env` :
```bash
nano .env
```

Contenu :
```env
# Database
DB_HOST=ksm.cr8qe06yq39x.af-south-1.rds.amazonaws.com
DB_NAME=ksm
DB_USER=postgres
DB_PASSWORD=<votre_mot_de_passe>
DB_PORT=5432

# Django
SECRET_KEY=<générer_avec_django>
DEBUG=False
ALLOWED_HOSTS=kalelsamatch.duckdns.org,localhost,127.0.0.1

# CORS
CORS_ALLOWED_ORIGINS=https://kalelsamatch.duckdns.org,http://localhost:5173

# AWS (optionnel pour S3)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
```

### 4. Initialisation Base de Données

```bash
# Appliquer migrations
python manage.py migrate

# Créer superuser admin
python manage.py createsuperuser
# Email: admin@kalelsamatch.com
# Password: (choisir un mot de passe sécurisé)

# Collecter fichiers statiques
python manage.py collectstatic --noinput
```

### 5. Test Backend Local

```bash
# Test serveur de dev
python manage.py runserver 0.0.0.0:8000

# Dans un autre terminal, tester
curl http://localhost:8000/api/terrains/all-for-map
```

### 6. Configuration Gunicorn

Créer service systemd :
```bash
sudo nano /etc/systemd/system/gunicorn.service
```

Contenu :
```ini
[Unit]
Description=Gunicorn daemon for Kalel Sa Match
After=network.target

[Service]
User=ssm-user
Group=ssm-user
WorkingDirectory=/home/ssm-user/projects/ksm/python-backend
Environment="PATH=/home/ssm-user/projects/ksm/python-backend/.venv/bin"
ExecStart=/home/ssm-user/projects/ksm/python-backend/.venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/run/gunicorn.sock \
    --timeout 120 \
    --access-logfile /var/log/gunicorn/access.log \
    --error-logfile /var/log/gunicorn/error.log \
    ksm_backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

Créer répertoire logs :
```bash
sudo mkdir -p /var/log/gunicorn
sudo chown ssm-user:ssm-user /var/log/gunicorn
```

Activer et démarrer :
```bash
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn
sudo systemctl status gunicorn
```

---

## 🌐 Configuration Nginx

Fichier existant : `/etc/nginx/conf.d/ksm_nginx.conf`

Vérifier configuration :
```nginx
upstream gunicorn {
    server unix:/run/gunicorn.sock fail_timeout=0;
}

server {
    listen 80;
    server_name kalelsamatch.duckdns.org;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kalelsamatch.duckdns.org;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/kalelsamatch.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kalelsamatch.duckdns.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Static files
    location /static/ {
        alias /home/ssm-user/projects/ksm/python-backend/staticfiles/;
        expires 30d;
    }

    location /media/ {
        alias /home/ssm-user/projects/ksm/python-backend/media/;
        expires 30d;
    }

    # API
    location /api/ {
        proxy_pass http://gunicorn;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # Admin Django
    location /admin/ {
        proxy_pass http://gunicorn;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend (si hébergé sur même serveur)
    location / {
        root /var/www/ksm-frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

Tester et recharger :
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## ⚛️ Déploiement Frontend

### Build Production

```bash
# Sur votre machine locale
cd Frontend
npm install
npm run build

# Le dossier dist/ contient les fichiers à déployer
```

### Upload sur EC2

```bash
# Via SCP ou GitHub Actions
scp -r dist/* ec2-user@<ip>:/var/www/ksm-frontend/dist/
```

Ou via GitHub Actions (créer `.github/workflows/deploy.yml`) :
```yaml
name: Deploy Frontend
on:
  push:
    branches: [main]
    paths: ['Frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Build
        run: |
          cd Frontend
          npm ci
          npm run build
      - name: Deploy to EC2
        run: |
          # Ajouter logique de déploiement SSH
```

---

## 🔄 Script de Déploiement Automatique

Utiliser `deploy_ec2.sh` :

```bash
# Se connecter à EC2
aws ssm start-session --target <instance-id>

# Accéder au projet
cd /home/ssm-user/projects/ksm/python-backend

# Rendre le script exécutable
chmod +x deploy_ec2.sh

# Exécuter le déploiement
./deploy_ec2.sh
```

Le script effectue automatiquement :
- ✅ Vérification connexion RDS
- ✅ Backup base de données
- ✅ Pull GitHub
- ✅ Installation dépendances
- ✅ Migrations DB
- ✅ Collecte statiques
- ✅ Redémarrage Gunicorn/Nginx
- ✅ Tests de santé

---

## 🧪 Tests & Vérification

### Tests Backend

```bash
# Health check
curl https://kalelsamatch.duckdns.org/api/health/

# Liste terrains
curl https://kalelsamatch.duckdns.org/api/terrains/all-for-map

# Admin Django
https://kalelsamatch.duckdns.org/admin/
```

### Vérifier Logs

```bash
# Logs Gunicorn
tail -f /var/log/gunicorn/error.log

# Logs Nginx
tail -f /var/log/nginx/error.log

# Logs Django (si configuré)
tail -f /var/log/django/debug.log
```

### Vérifier Services

```bash
sudo systemctl status gunicorn
sudo systemctl status nginx
```

---

## 🔧 Maintenance

### Mises à Jour

```bash
# Backend
cd /home/ssm-user/projects/ksm/python-backend
./deploy_ec2.sh

# Frontend
cd Frontend
npm run build
# Upload dist/
```

### Backup Base de Données

```bash
# Manuel
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h ksm.cr8qe06yq39x.af-south-1.rds.amazonaws.com \
  -U postgres \
  -d ksm \
  -F c \
  -f backup_$(date +%Y%m%d).dump

# Automatique (cron)
0 2 * * * /home/ssm-user/scripts/backup_db.sh
```

### Monitoring

```bash
# Stats RDS via script
cd /home/ssm-user/projects/ksm/python-backend
./check_existing_data.sh

# Métriques Gunicorn
curl http://localhost:8000/api/admin/stats/dashboard/
```

---

## 🆘 Dépannage

### Erreur 502 Bad Gateway

```bash
# Vérifier Gunicorn
sudo systemctl status gunicorn
sudo journalctl -u gunicorn -n 50

# Redémarrer
sudo systemctl restart gunicorn
```

### Erreur Base de Données

```bash
# Vérifier connectivité RDS
python manage.py dbshell

# Vérifier migrations
python manage.py showmigrations
python manage.py migrate
```

### Certificat SSL Expiré

```bash
# Renouveler Let's Encrypt
sudo certbot renew
sudo systemctl reload nginx
```

---

## 📞 Support

- **Documentation API** : `https://kalelsamatch.duckdns.org/api/docs/`
- **Admin Django** : `https://kalelsamatch.duckdns.org/admin/`
- **GitHub Issues** : `https://github.com/CnG990/Kalel-Sa-Match/issues`

---

## 🎯 Checklist Déploiement

- [ ] RDS PostgreSQL accessible
- [ ] Variables `.env` configurées
- [ ] Migrations appliquées
- [ ] Superuser créé
- [ ] Gunicorn démarré
- [ ] Nginx configuré et démarré
- [ ] SSL actif
- [ ] Frontend build et déployé
- [ ] Tests API réussis
- [ ] Backup configuré
- [ ] Monitoring actif

**Déploiement réussi ! 🎉**
