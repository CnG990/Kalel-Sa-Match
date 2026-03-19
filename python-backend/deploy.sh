#!/bin/bash

# Déploiement Django sur EC2 avec RDS PostgreSQL

echo "🚀 Début du déploiement Django REST..."

# Variables d'environnement
export DJANGO_SETTINGS_MODULE=ksm_backend.settings.production
export PYTHONPATH=$PYTHONPATH:/home/ec2-user/app

# 1. Installation des dépendances
echo "📦 Installation des dépendances..."
pip install -r requirements.txt

# 2. Collecte des fichiers statiques
echo "🗂️  Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# 3. Appliquer les migrations
echo "🗄️  Application des migrations..."
python manage.py migrate

# 4. Créer un superuser si nécessaire
echo "👤 Création du superuser..."
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
    print('Superuser créé')
else:
    print('Superuser existe déjà')
EOF

# 5. Redémarrer les services
echo "🔄 Redémarrage des services..."
sudo systemctl restart nginx
sudo systemctl restart gunicorn

echo "✅ Déploiement terminé!"
echo "🌐 URL: https://kalelsamatch.duckdns.org"
echo "🔧 Admin: https://kalelsamatch.duckdns.org/admin"
