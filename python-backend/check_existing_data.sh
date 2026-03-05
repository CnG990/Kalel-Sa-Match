#!/bin/bash

# Script pour vérifier les données existantes avant déploiement
echo "🔍 Vérification des données existantes sur RDS"
echo "=================================================="
echo ""

# 1. Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    echo "❌ Fichier .env introuvable"
    exit 1
fi

# 2. Charger les variables d'environnement
source .env

echo "📋 Configuration base de données:"
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# 3. Test de connexion et comptage
echo "🔗 Connexion à PostgreSQL..."
python3 <<'PYCODE'
import os, psycopg2
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
    print("✅ Connexion réussie!\n")

    # Vérifier les utilisateurs
    try:
        cur.execute("SELECT COUNT(*) FROM accounts_user")
        users = cur.fetchone()[0]
        print(f"👥 Utilisateurs: {users}")
        
        if users > 0:
            cur.execute("SELECT email, nom, prenom, role FROM accounts_user ORDER BY id LIMIT 5")
            user_list = cur.fetchall()
            print("   Exemples:")
            for u in user_list:
                print(f"   - {u[0]} ({u[1]} {u[2]}) - {u[3]}")
    except Exception as e:
        print(f"⚠️  Utilisateurs: Table non trouvée ({e})")

    # Vérifier les terrains
    try:
        cur.execute("SELECT COUNT(*) FROM terrains_synthetiques_dakar")
        terrains = cur.fetchone()[0]
        print(f"\n⚽ Terrains: {terrains}")
        
        if terrains > 0:
            cur.execute("SELECT nom, adresse, est_actif FROM terrains_synthetiques_dakar ORDER BY id LIMIT 5")
            terrain_list = cur.fetchall()
            print("   Exemples:")
            for t in terrain_list:
                status = "✅" if t[2] else "❌"
                print(f"   {status} {t[0]} - {t[1]}")
    except Exception as e:
        print(f"⚠️  Terrains: Table non trouvée ({e})")

    # Vérifier les réservations
    try:
        cur.execute("SELECT COUNT(*) FROM reservations")
        resa = cur.fetchone()[0]
        print(f"\n📅 Réservations: {resa}")
    except Exception as e:
        print(f"⚠️  Réservations: Table non trouvée ({e})")
    
    # Vérifier les paiements
    try:
        cur.execute("SELECT COUNT(*) FROM payments")
        payments = cur.fetchone()[0]
        print(f"💰 Paiements: {payments}")
    except Exception as e:
        print(f"⚠️  Paiements: Table non trouvée ({e})")
    
    # Vérifier les tickets support
    try:
        cur.execute("SELECT COUNT(*) FROM tickets_support")
        tickets = cur.fetchone()[0]
        print(f"🎫 Tickets support: {tickets}")
    except Exception as e:
        print(f"⚠️  Tickets: Table non trouvée ({e})")

    conn.close()
    print("\n✅ Vérification terminée avec succès")
    
except Exception as e:
    print(f"❌ Erreur de connexion: {e}")
    exit(1)
PYCODE

echo ""
echo "🎯 Recommandations:"
echo "   - Si les tables existent avec des données, les migrations ne modifieront que la structure"
echo "   - Aucune donnée ne sera perdue lors du déploiement"
echo "   - Le superuser ne sera créé que si aucun admin n'existe"
