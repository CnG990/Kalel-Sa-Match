#!/usr/bin/env python3
"""
Script de test de connexion à la base de données RDS
"""
import os
import sys
import psycopg2
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

def test_db_connection():
    """Tester la connexion à la base de données"""
    
    # Paramètres de connexion
    db_host = os.getenv('DB_HOST')
    db_name = os.getenv('DB_NAME', 'ksm')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD')
    db_port = os.getenv('DB_PORT', '5432')
    
    print("🔍 Test de connexion à la base de données RDS")
    print(f"Host: {db_host}")
    print(f"Database: {db_name}")
    print(f"User: {db_user}")
    print(f"Port: {db_port}")
    print("-" * 50)
    
    if not all([db_host, db_name, db_user, db_password]):
        print("❌ Variables d'environnement manquantes!")
        print("Variables requises: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD")
        return False
    
    try:
        # Test de connexion avec psycopg2
        print("🔗 Connexion à PostgreSQL...")
        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password,
            port=db_port,
            sslmode='require',
            connect_timeout=10
        )
        
        print("✅ Connexion réussie!")
        
        # Test de requête simple
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"📊 Version PostgreSQL: {version[0]}")
        
        # Vérifier les tables
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
        tables = cursor.fetchall()
        print(f"📋 Tables trouvées: {len(tables)}")
        for table in tables:
            print(f"   - {table[0]}")
        
        cursor.close()
        conn.close()
        
        print("✅ Test de base de données terminé avec succès!")
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ Erreur de connexion PostgreSQL: {e}")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False

def test_dns_resolution():
    """Tester la résolution DNS"""
    import socket
    
    db_host = os.getenv('DB_HOST')
    print(f"🌐 Test de résolution DNS pour: {db_host}")
    
    try:
        ip = socket.gethostbyname(db_host)
        print(f"✅ DNS résolu: {db_host} -> {ip}")
        return True
    except socket.gaierror as e:
        print(f"❌ Erreur DNS: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Test de configuration base de données RDS")
    print("=" * 60)
    
    # Test DNS
    dns_ok = test_dns_resolution()
    print()
    
    # Test connexion DB
    if dns_ok:
        db_ok = test_db_connection()
    else:
        print("❌ Le test de base de données ne peut pas être effectué (erreur DNS)")
        db_ok = False
    
    print()
    if dns_ok and db_ok:
        print("🎉 Tous les tests sont passés avec succès!")
        sys.exit(0)
    else:
        print("💥 Certains tests ont échoué. Vérifiez la configuration.")
        sys.exit(1)
