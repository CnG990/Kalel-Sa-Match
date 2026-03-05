#!/bin/bash

# Script pour vérifier les données existantes avant déploiement
echo "🔍 Vérification des données existantes sur RDS"
echo "=================================================="

# 1. Variables d'environnement
source .env

echo "📋 Configuration base de données:"
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# 2. Test de connexion
echo "🔗 Test de connexion à PostgreSQL..."
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
    cursor = conn.cursor()
    
    # Vérifier les tables
    cursor.execute(\"\"\"
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    \"\"\")
    tables = cursor.fetchall()
    print(f'📊 Tables trouvées ({len(tables)}):')
    for table in tables:
        print(f'   - {table[0]}')
    
    # Vérifier les utilisateurs
    try:
        cursor.execute('SELECT COUNT(*) FROM auth_user')
        user_count = cursor.fetchone()[0]
        print(f'👥 Utilisateurs existants: {user_count}')
        
        if user_count > 0:
            cursor.execute('SELECT email, first_name, last_name, is_superuser FROM auth_user ORDER BY id')
            users = cursor.fetchall()
            print('📋 Liste des utilisateurs:')
            for user in users:
                superuser_flag = '👑' if user[3] else '👤'
                print(f'   {superuser_flag} {user[0]} ({user[1]} {user[2]})')
    except:
        print('ℹ️  Table auth_user non trouvée')
    
    # Vérifier les terrains
    try:
        cursor.execute('SELECT COUNT(*) FROM terrains_synthetiques_dakar')
        terrain_count = cursor.fetchone()[0]
        print(f'⚽ Terrains existants: {terrain_count}')
        
        if terrain_count > 0:
            cursor.execute('SELECT nom, adresse, est_actif FROM terrains_synthetiques_dakar ORDER BY id')
            terrains = cursor.fetchall()
            print('📋 Liste des terrains:')
            for terrain in terrains:
                status = '✅' if terrain[2] else '❌'
                print(f'   {status} {terrain[0]} - {terrain[1]}')
    except:
        print('ℹ️  Table terrains_synthetiques_dakar non trouvée')
    
    # Vérifier les réservations
    try:
        cursor.execute('SELECT COUNT(*) FROM reservations')
        reservation_count = cursor.fetchone()[0]
        print(f'📅 Réservations existantes: {reservation_count}')
    except:
        print('ℹ️  Table reservations non trouvée')
    
    cursor.close()
    conn.close()
    print('✅ Vérification terminée!')
    
except Exception as e:
    print(f'❌ Erreur: {e}')
    exit(1)
"

echo ""
echo "🎯 Recommandations:"
if [ "$user_count" -gt 0 ]; then
    echo "✅ Base de données contient déjà des utilisateurs"
    echo "   - Les migrations ne seront PAS réappliquées"
    echo "   - Le superuser ne sera PAS recréé"
else
    echo "🆕 Base de données vide"
    echo "   - Les migrations seront appliquées"
    echo "   - Le superuser sera créé"
fi
