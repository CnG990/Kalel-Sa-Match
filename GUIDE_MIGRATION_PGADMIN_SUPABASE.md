# Guide : Migration Base de Données via pgAdmin

## 🎯 Objectif

Connecter Supabase à pgAdmin et transférer vos données de votre base locale vers Supabase.

---

## Étape 1 : Récupérer les Informations de Connexion Supabase

1. Dans Supabase Dashboard, aller dans **Settings** > **Database**
2. Noter les informations suivantes :
   - **Host** : `db.xxxxx.supabase.co`
   - **Database name** : `postgres`
   - **Port** : `5432`
   - **User** : `postgres`
   - **Password** : `Terrains2024!Supabase#Secure` (celui que vous avez créé)

3. **Important** : Pour pgAdmin, vous devez utiliser le **Connection Pooler** :
   - **Host** : `db.xxxxx.supabase.co` (même host)
   - **Port** : `6543` (au lieu de 5432) ⚠️
   - **Database** : `postgres`
   - **User** : `postgres`
   - **Password** : `Terrains2024!Supabase#Secure`

---

## Étape 2 : Connecter Supabase à pgAdmin

### 2.1 Créer une Nouvelle Connexion dans pgAdmin

1. Ouvrir **pgAdmin**
2. Clic droit sur **Servers** > **Create** > **Server...**

3. Dans l'onglet **General** :
   - **Name** : `Supabase - Terrains Synthetiques`

4. Dans l'onglet **Connection** :
   - **Host name/address** : `db.xxxxx.supabase.co`
   - **Port** : `6543` (⚠️ Pooler port, pas 5432)
   - **Maintenance database** : `postgres`
   - **Username** : `postgres`
   - **Password** : `Terrains2024!Supabase#Secure`
   - ✅ Cocher **"Save password"**

5. Dans l'onglet **SSL** :
   - **SSL mode** : `Require` (obligatoire pour Supabase)

6. Cliquer sur **Save**

### 2.2 Tester la Connexion

Si la connexion fonctionne, vous devriez voir :
- ✅ Le serveur apparaît dans pgAdmin
- ✅ Vous pouvez explorer les bases de données

---

## Étape 3 : Exporter les Données de votre Base Locale

### 3.1 Via pgAdmin (Interface Graphique)

1. Clic droit sur votre base de données **locale**
2. **Backup...**

3. Configuration :
   - **Filename** : `backup_terrains.sql`
   - **Format** : `Plain` (pour SQL) ou `Custom` (pour pg_restore)
   - **Encoding** : `UTF8`

4. Dans l'onglet **Data/Objects** :
   - ✅ Cocher **"Only data"** (si vous voulez seulement les données)
   - ✅ OU cocher **"Only schema"** (si vous voulez seulement la structure)
   - ✅ OU les deux (recommandé : **"Pre-data"** + **"Data"**)

5. Cliquer sur **Backup**

### 3.2 Via Ligne de Commande (Alternative)

```bash
# Exporter la structure + données
pg_dump -h localhost -U postgres -d votre_base_locale -F p -f backup_terrains.sql

# OU exporter seulement les données
pg_dump -h localhost -U postgres -d votre_base_locale --data-only -f backup_data.sql

# OU exporter seulement la structure
pg_dump -h localhost -U postgres -d votre_base_locale --schema-only -f backup_schema.sql
```

---

## Étape 4 : Préparer le Backup pour Supabase

### 4.1 Modifier le Fichier SQL (si nécessaire)

Ouvrir `backup_terrains.sql` dans un éditeur de texte et :

1. **Supprimer les commandes CREATE DATABASE** (si présentes)
2. **Supprimer les commandes CREATE USER** (si présentes)
3. **Vérifier les extensions** :
   - Chercher `CREATE EXTENSION postgis;`
   - Si absent, ajouter en début de fichier :
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

### 4.2 Exemple de Fichier Préparé

```sql
-- Activer PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Supprimer les tables si elles existent (optionnel)
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS terrains_synthetiques_dakar CASCADE;
DROP TABLE IF EXISTS users CASCADE;
-- ... etc

-- Créer les tables
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    -- ... autres colonnes
);

-- Insérer les données
INSERT INTO users (id, email, ...) VALUES (...);
-- ... etc
```

---

## Étape 5 : Importer dans Supabase

### Option A : Via pgAdmin (Recommandé)

1. Se connecter à **Supabase** dans pgAdmin
2. Clic droit sur la base **postgres**
3. **Query Tool**
4. Ouvrir le fichier `backup_terrains.sql`
5. Exécuter (F5 ou bouton ▶️)

### Option B : Via SQL Editor Supabase

1. Dans Supabase Dashboard, aller dans **SQL Editor**
2. Cliquer sur **New Query**
3. Copier-coller le contenu de `backup_terrains.sql`
4. Cliquer sur **Run** (ou Ctrl+Enter)

### Option C : Via Ligne de Commande

```bash
# Se connecter à Supabase et exécuter le script
psql -h db.xxxxx.supabase.co -p 6543 -U postgres -d postgres -f backup_terrains.sql
```

---

## Étape 6 : Vérifier la Migration

### 6.1 Vérifier les Tables

Dans pgAdmin ou Supabase SQL Editor :

```sql
-- Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Compter les enregistrements
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'terrains_synthetiques_dakar', COUNT(*) FROM terrains_synthetiques_dakar
UNION ALL
SELECT 'reservations', COUNT(*) FROM reservations;
-- ... etc
```

### 6.2 Vérifier PostGIS

```sql
-- Vérifier que PostGIS est activé
SELECT PostGIS_version();

-- Vérifier les colonnes géométriques
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE data_type LIKE '%geometry%';
```

### 6.3 Tester les Données

```sql
-- Tester une requête avec PostGIS
SELECT 
    id,
    nom,
    ST_Area(ST_Transform(geom_polygon, 32628)) as surface_m2
FROM terrains_synthetiques_dakar
WHERE geom_polygon IS NOT NULL
LIMIT 5;
```

---

## ⚠️ Problèmes Courants

### Erreur : "Connection refused"

**Solution** :
- Vérifier que vous utilisez le port **6543** (pooler) et non 5432
- Vérifier que le SSL est activé (mode "Require")

### Erreur : "Extension postgis does not exist"

**Solution** :
- PostGIS est déjà activé dans Supabase
- Si erreur, exécuter manuellement :
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Erreur : "Permission denied"

**Solution** :
- Vérifier que vous utilisez l'utilisateur `postgres`
- Vérifier le mot de passe

### Erreur : "Table already exists"

**Solution** :
- Supprimer les tables existantes avant d'importer :
```sql
DROP TABLE IF EXISTS nom_table CASCADE;
```

---

## 📋 Checklist de Migration

- [ ] Récupérer les credentials Supabase
- [ ] Connecter Supabase à pgAdmin (port 6543, SSL Require)
- [ ] Exporter la base locale (pgAdmin Backup)
- [ ] Préparer le fichier SQL (supprimer CREATE DATABASE/USER)
- [ ] Ajouter `CREATE EXTENSION IF NOT EXISTS postgis;` si nécessaire
- [ ] Importer dans Supabase (via pgAdmin Query Tool ou SQL Editor)
- [ ] Vérifier les tables créées
- [ ] Vérifier le nombre d'enregistrements
- [ ] Tester PostGIS
- [ ] Tester une requête complexe

---

## 🎯 Alternative : Migration via Laravel

Si vous préférez utiliser Laravel pour migrer :

```bash
# 1. Modifier Backend/.env pour pointer vers Supabase
DB_CONNECTION=pgsql
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=Terrains2024!Supabase#Secure

# 2. Exécuter les migrations
cd Backend
php artisan migrate:fresh --seed

# OU migrer les données existantes
php artisan db:seed --class=YourDataSeeder
```

---

## ✅ Résumé

**Méthode Recommandée** :
1. ✅ Exporter via pgAdmin (Backup)
2. ✅ Préparer le fichier SQL
3. ✅ Importer via Supabase SQL Editor (le plus simple)

**Mot de passe confirmé** : `Terrains2024!Supabase#Secure` ✅

**Port pour pgAdmin** : **6543** (pooler) ⚠️

**SSL** : **Require** (obligatoire)

---

## 🚀 Prochaines Étapes

Une fois la migration terminée :
1. ✅ Tester la connexion Laravel → Supabase
2. ✅ Vérifier que toutes les fonctionnalités fonctionnent
3. ✅ Configurer Render.com avec les credentials Supabase

**Besoin d'aide pour une étape précise ? Dites-moi où vous en êtes !** 🎯

