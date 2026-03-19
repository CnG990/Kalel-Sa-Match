# 🚀 Déploiement EC2 - KalelSaMatch Backend

## 📋 Prérequis

- Instance EC2 avec Session Manager activé
- Base de données RDS PostgreSQL configurée
- Git installé sur l'instance

## 🔧 Étapes de déploiement

### 1. Connexion via Session Manager

```bash
# Se connecter à l'instance EC2
aws ssm start-session --target i-xxxxxxxxxxxxxxxxx
```

### 2. Cloner le repository

```bash
# Cloner le projet
git clone https://github.com/CnG990/Kalel-Sa-Match.git
cd Kalel-Sa-Match/python-backend
```

### 3. Configurer l'environnement

```bash
# Créer le fichier .env avec les variables RDS
cat > .env << EOF
DB_HOST=ksm-db.cr8qe06yq39x.af-south-1.rds.amazonaws.com
DB_NAME=ksm
DB_USER=postgres
DB_PASSWORD=Ksm2026!API
DB_PORT=5432

DJANGO_SECRET_KEY=django-insecure-change-me-in-production
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,kalelsamatch.duckdns.org

CORS_ALLOWED_ORIGINS=https://kalelsamatch.web.app,https://kalelsamatch.firebaseapp.com,http://localhost:5173,http://127.0.0.1:5173
EOF
```

### 4. Installation des dépendances

```bash
# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### 5. Vérification de la configuration

```bash
# Lancer le script de vérification
chmod +x ec2_deployment_check.sh
./ec2_deployment_check.sh
```

### 6. Appliquer les migrations

```bash
# Appliquer les migrations Django
python manage.py migrate
```

### 7. Créer le superuser

```bash
# Créer le superuser administrateur
python manage.py createsuperuser
```

### 8. Lancer le serveur

```bash
# Lancer avec gunicorn
gunicorn ksm_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3

# Ou en arrière-plan
nohup gunicorn ksm_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3 > app.log 2>&1 &
```

## 🔍 Dépannage

### Problème DNS

Si la résolution DNS échoue:

```bash
# Vérifier le hostname
nslookup ksm-db.cr8qe06yq39x.af-south-1.rds.amazonaws.com

# Tester avec l'IP directe (si connue)
ping <IP_RDS>
```

### Problème de connexion

Vérifier:
- Security Group EC2 autorise le port 5432
- Security Group RDS autorise l'IP EC2
- Variables d'environnement correctes

### Logs

```bash
# Vérifier les logs Django
tail -f app.log

# Vérifier les logs système
sudo journalctl -u gunicorn
```

## 🌐 URLs de l'application

- **API Backend**: `https://kalelsamatch.duckdns.org/api/`
- **Admin Django**: `https://kalelsamatch.duckdns.org/admin/`
- **Frontend**: `https://kalelsamatch.web.app`

## 📊 API Endpoints principales

### Authentification
- `POST /api/accounts/login/`
- `POST /api/accounts/register/`
- `GET /api/accounts/me/`

### Terrains
- `GET /api/terrains/`
- `GET /api/terrains/{id}/`

### Réservations
- `POST /api/reservations/`
- `GET /api/reservations/my/`
- `POST /api/reservations/validate-qr/`

### Paiements
- `POST /api/payments/init/`
- `POST /api/payments/wave/webhook/`

### Manager
- `GET /api/manager/terrains/`
- `GET /api/manager/stats/dashboard/`

### Admin
- `GET /api/admin/users/`
- `GET /api/admin/stats/dashboard/`

## 🔐 Configuration production

Le fichier `settings/production.py` contient:
- Configuration RDS PostgreSQL
- SSL/HTTPS obligatoire
- Logging configuré
- CORS restreint
- Sécurité renforcée
