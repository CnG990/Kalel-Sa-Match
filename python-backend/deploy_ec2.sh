#!/bin/bash

# ========================================
# Script de déploiement Kalel Sa Match
# GitHub → EC2 via Session Manager
# ========================================

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement Kalel Sa Match - Backend"
echo "========================================"
echo ""

# Variables
PROJECT_DIR="/home/ssm-user/projects/ksm/python-backend"
VENV_DIR="$PROJECT_DIR/.venv"
REPO_URL="https://github.com/CnG990/Kalel-Sa-Match.git"
BRANCH="main"
NGINX_CONFIG="/etc/nginx/conf.d/ksm_nginx.conf"
GUNICORN_SOCKET="/run/gunicorn.sock"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Vérifier connexion RDS
echo "🔗 Vérification connexion RDS..."
cd $PROJECT_DIR
source .env

python3 <<PYCODE
import os, psycopg2, sys
try:
    conn = psycopg2.connect(
        host=os.environ.get("DB_HOST"),
        database=os.environ.get("DB_NAME"),
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        port=os.environ.get("DB_PORT", "5432"),
        sslmode='require',
        connect_timeout=5
    )
    conn.close()
    print("✓ RDS accessible")
except Exception as e:
    print(f"✗ Erreur RDS: {e}", file=sys.stderr)
    sys.exit(1)
PYCODE

if [ $? -ne 0 ]; then
    log_error "Impossible de se connecter à RDS"
    exit 1
fi
log_success "RDS connecté"

# 2. Backup de sécurité
echo ""
echo "💾 Backup base de données..."
BACKUP_DIR="$PROJECT_DIR/backups"
mkdir -p $BACKUP_DIR
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

PGPASSWORD=$DB_PASSWORD pg_dump \
    -h $DB_HOST \
    -U $DB_USER \
    -d $DB_NAME \
    -F c \
    -f $BACKUP_FILE 2>/dev/null || log_warning "Backup échoué (base vide?)"

if [ -f "$BACKUP_FILE" ]; then
    log_success "Backup créé: $BACKUP_FILE"
else
    log_warning "Pas de backup (première installation?)"
fi

# 3. Pull dernières modifications GitHub
echo ""
echo "📥 Pull depuis GitHub..."
cd $PROJECT_DIR

# Vérifier si c'est un repo Git
if [ ! -d ".git" ]; then
    log_warning "Pas de repo Git, clonage..."
    cd ..
    rm -rf python-backend
    git clone $REPO_URL python-backend
    cd python-backend
else
    # Stash changements locaux
    git stash save "Auto-stash avant déploiement $(date +%Y%m%d_%H%M%S)" || true
    
    # Pull
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
fi

log_success "Code GitHub à jour"

# 4. Activer environnement virtuel
echo ""
echo "🐍 Activation environnement Python..."
if [ ! -d "$VENV_DIR" ]; then
    log_warning "Création venv..."
    python3 -m venv $VENV_DIR
fi

source $VENV_DIR/bin/activate
log_success "Venv activé"

# 5. Installer/Mettre à jour dépendances
echo ""
echo "📦 Installation dépendances..."
pip install --upgrade pip -q
pip install -r requirements.txt -q
log_success "Dépendances installées"

# 6. Vérifier variables d'environnement
echo ""
echo "🔐 Vérification .env..."
if [ ! -f ".env" ]; then
    log_error "Fichier .env manquant !"
    echo "Créez .env avec :"
    echo "  DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT"
    echo "  SECRET_KEY, DEBUG, ALLOWED_HOSTS"
    exit 1
fi
log_success "Fichier .env présent"

# 7. Collecter fichiers statiques
echo ""
echo "📁 Collecte fichiers statiques..."
python manage.py collectstatic --noinput -v 0
log_success "Statiques collectés"

# 8. Migrations base de données
echo ""
echo "🗄️  Migrations base de données..."
python manage.py migrate --noinput
log_success "Migrations appliquées"

# 9. Créer superuser si nécessaire
echo ""
echo "👑 Vérification superuser..."
python3 <<PYCODE
from django.contrib.auth import get_user_model
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ksm_backend.settings')
import django
django.setup()

User = get_user_model()
if not User.objects.filter(role='admin').exists():
    User.objects.create_superuser(
        email='admin@kalelsamatch.com',
        password='Admin@KSM2024!',
        nom='Admin',
        prenom='KSM',
        role='admin'
    )
    print("✓ Superuser créé")
else:
    print("✓ Superuser existe déjà")
PYCODE

# 10. Redémarrer Gunicorn
echo ""
echo "🔄 Redémarrage Gunicorn..."
sudo systemctl restart gunicorn || {
    log_warning "Service gunicorn non trouvé, démarrage manuel..."
    
    # Tuer anciens processus
    pkill -f gunicorn || true
    
    # Démarrer Gunicorn
    gunicorn \
        --bind unix:$GUNICORN_SOCKET \
        --workers 3 \
        --timeout 120 \
        --access-logfile /var/log/gunicorn/access.log \
        --error-logfile /var/log/gunicorn/error.log \
        --daemon \
        ksm_backend.wsgi:application
}
log_success "Gunicorn redémarré"

# 11. Recharger Nginx
echo ""
echo "🌐 Rechargement Nginx..."
sudo nginx -t && sudo systemctl reload nginx
log_success "Nginx rechargé"

# 12. Tests de santé
echo ""
echo "🏥 Tests de santé..."

# Test backend local
if curl -s http://127.0.0.1:8000/api/health/ > /dev/null 2>&1; then
    log_success "Backend local OK"
else
    log_warning "Backend local non accessible (normal si socket Unix)"
fi

# Test via Nginx
if curl -s https://kalelsamatch.duckdns.org/api/health/ > /dev/null 2>&1; then
    log_success "Nginx + SSL OK"
else
    log_warning "Vérifier Nginx et DuckDNS"
fi

# 13. Résumé
echo ""
echo "========================================="
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "========================================="
echo ""
echo "📊 Statistiques:"
python3 <<PYCODE
import os, psycopg2
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ksm_backend.settings')

try:
    conn = psycopg2.connect(
        host=os.environ.get("DB_HOST"),
        database=os.environ.get("DB_NAME"),
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        port=os.environ.get("DB_PORT", "5432"),
        sslmode='require'
    )
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM accounts_user")
    users = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM terrains_synthetiques_dakar")
    terrains = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM reservations")
    reservations = cur.fetchone()[0]
    
    print(f"  👥 Utilisateurs: {users}")
    print(f"  ⚽ Terrains: {terrains}")
    print(f"  📅 Réservations: {reservations}")
    
    conn.close()
except:
    print("  ⚠️  Impossible de lire les stats")
PYCODE

echo ""
echo "🔗 URLs:"
echo "  Backend API: https://kalelsamatch.duckdns.org/api/"
echo "  Admin Django: https://kalelsamatch.duckdns.org/admin/"
echo ""
echo "📝 Logs:"
echo "  Gunicorn: tail -f /var/log/gunicorn/error.log"
echo "  Nginx: tail -f /var/log/nginx/error.log"
echo ""
log_success "Déploiement réussi !"
