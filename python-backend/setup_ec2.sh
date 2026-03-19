#!/bin/bash

# Script d'installation et configuration pour EC2
echo "🚀 Configuration de KalelSaMatch Backend sur EC2"
echo "=================================================="

# 1. Mettre à jour le système
echo "📦 Mise à jour du système..."
sudo yum update -y
sudo yum install -y git python3 python3-pip postgresql

# 2. Installer Python et dépendances
echo "🐍 Installation Python 3..."
sudo yum install -y python3 python3-pip python3-devel

# 3. Cloner le repository
echo "📥 Clonage du repository..."
if [ ! -d "Kalel-Sa-Match" ]; then
    git clone https://github.com/CnG990/Kalel-Sa-Match.git
fi
cd Kalel-Sa-Match/python-backend

# 4. Créer l'environnement virtuel
echo "🔧 Création environnement virtuel..."
python3 -m venv venv
source venv/bin/activate

# 5. Installer les dépendances Python
echo "📦 Installation des dépendances..."
pip install --upgrade pip
pip install -r requirements.txt

# 6. Configurer les variables d'environnement
echo "⚙️  Configuration des variables d'environnement..."
cat > .env << EOF
DB_HOST=ksm-db.cr8qe06yq39x.af-south-1.rds.amazonaws.com
DB_NAME=ksm
DB_USER=postgres
DB_PASSWORD=Ksm2026!API
DB_PORT=5432

DJANGO_SECRET_KEY=django-insecure-change-me-in-production-$(date +%s)
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,kalelsamatch.duckdns.org,0.0.0.0

CORS_ALLOWED_ORIGINS=https://kalelsamatch.web.app,https://kalelsamatch.firebaseapp.com,http://localhost:5173,http://127.0.0.1:5173
EOF

# 7. Tester la connexion à la base de données
echo "🗄️  Test de connexion base de données..."
python3 -c "
import os
import psycopg2
try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        port=os.getenv('DB_PORT'),
        sslmode='require'
    )
    print('✅ Connexion base de données réussie!')
    conn.close()
except Exception as e:
    print(f'❌ Erreur connexion DB: {e}')
    exit(1)
"

# 7. Vérifier les données existantes
echo "🔍 Vérification des données existantes..."
chmod +x check_existing_data.sh
./check_existing_data.sh

# 8. Appliquer les migrations Django
echo "🔄 Application des migrations Django..."
python manage.py migrate

# 9. Créer le superuser
echo "👤 Vérification/Création du superuser..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@kalelsamatch.com').exists():
    User.objects.create_superuser(
        email='admin@kalelsamatch.com',
        password='Admin123!',
        prenom='Admin',
        nom='KalelSaMatch'
    )
    print('✅ Superuser créé avec succès!')
else:
    print('ℹ️  Superuser existe déjà')
    # Afficher les utilisateurs existants
    users = User.objects.filter(is_superuser=True)
    print('📋 Superusers existants:')
    for user in users:
        print(f'   - {user.email} ({user.prenom} {user.nom})')
EOF

# 10. Créer les répertoires nécessaires
echo "📁 Création des répertoires..."
mkdir -p staticfiles
mkdir -p media

# 11. Collecter les fichiers statiques
echo "🗂️  Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# 12. Créer le service systemd
echo "🔧 Configuration du service systemd..."
sudo tee /etc/systemd/system/kalelsamatch.service > /dev/null << EOF
[Unit]
Description=KalelSaMatch Django Application
After=network.target

[Service]
Type=exec
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/Kalel-Sa-Match/python-backend
Environment=PATH=/home/ec2-user/Kalel-Sa-Match/python-backend/venv/bin
ExecStart=/home/ec2-user/Kalel-Sa-Match/python-backend/venv/bin/gunicorn ksm_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 13. Activer et démarrer le service
echo "🚀 Démarrage du service..."
sudo systemctl daemon-reload
sudo systemctl enable kalelsamatch
sudo systemctl start kalelsamatch

# 14. Vérifier le statut
echo "📊 Vérification du statut..."
sudo systemctl status kalelsamatch

# 15. Configurer le firewall
echo "🔥 Configuration du firewall..."
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload

echo ""
echo "🎉 Installation terminée!"
echo "🌐 URL de l'API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000/api/"
echo "🔧 Admin Django: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000/admin/"
echo "📊 Logs: sudo journalctl -u kalelsamatch -f"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Configurer le reverse proxy (nginx/apache)"
echo "   2. Installer SSL certificate"
echo "   3. Configurer le domaine personnalisé"
