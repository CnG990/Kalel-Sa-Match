#!/bin/bash

# Script de vérification et déploiement pour EC2 avec Session Manager
echo "🚀 Vérification de l'environnement EC2 pour KalelSaMatch"
echo "=================================================="

# 1. Vérifier les variables d'environnement
echo "📋 Variables d'environnement:"
echo "DB_HOST: $DB_HOST"
echo "DB_NAME: $DB_NAME"
echo "DB_USER: $DB_USER"
echo "DB_PORT: $DB_PORT"
echo "DJANGO_SECRET_KEY: ${DJANGO_SECRET_KEY:0:20}..."
echo ""

# 2. Vérifier la résolution DNS
echo "🌐 Test de résolution DNS:"
if command -v nslookup &> /dev/null; then
    nslookup $DB_HOST
elif command -v dig &> /dev/null; then
    dig +short $DB_HOST
else
    getent hosts $DB_HOST
fi
echo ""

# 3. Vérifier la connectivité réseau
echo "🔗 Test de connectivité réseau:"
if command -v nc &> /dev/null; then
    nc -zv $DB_HOST $DB_PORT
elif command -v telnet &> /dev/null; then
    timeout 5 telnet $DB_HOST $DB_PORT
else
    echo "⚠️  nc ou telnet non disponible"
fi
echo ""

# 4. Vérifier Python et environnement virtuel
echo "🐍 Vérification Python:"
python3 --version
which python3
echo ""

# 5. Vérifier les dépendances
echo "📦 Vérification des dépendances:"
if [ -d "venv" ]; then
    echo "✅ Environnement virtuel trouvé"
    source venv/bin/activate
    pip list | grep -E "(django|psycopg|gunicorn)"
else
    echo "❌ Environnement virtuel non trouvé"
fi
echo ""

# 6. Test de connexion base de données
echo "🗄️  Test de connexion base de données:"
python3 -c "
import os
import psycopg2
try:
    conn = psycopg2.connect(
        host='$DB_HOST',
        database='$DB_NAME',
        user='$DB_USER',
        password='$DB_PASSWORD',
        port='$DB_PORT',
        sslmode='require',
        connect_timeout=10
    )
    cursor = conn.cursor()
    cursor.execute('SELECT version();')
    version = cursor.fetchone()
    print('✅ Connexion DB réussie!')
    print(f'PostgreSQL: {version[0][:50]}...')
    cursor.close()
    conn.close()
except Exception as e:
    print(f'❌ Erreur DB: {e}')
"
echo ""

# 7. Vérifier Django
echo "🔧 Vérification Django:"
if [ -f "manage.py" ]; then
    python3 manage.py check --deploy
    echo ""
    echo "📊 Migrations:"
    python3 manage.py showmigrations --plan
else
    echo "❌ manage.py non trouvé"
fi

echo ""
echo "🎉 Vérification terminée!"
echo "📝 Prochaines étapes:"
echo "   1. Si tout est OK: python3 manage.py migrate"
echo "   2. Créer superuser: python3 manage.py createsuperuser"
echo "   3. Lancer le serveur: gunicorn ksm_backend.wsgi:application --bind 0.0.0.0:8000"
