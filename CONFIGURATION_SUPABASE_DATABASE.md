# Configuration Supabase Database Settings

## 📋 Informations à Noter

Sur cette page, vous devez noter/récupérer :

### 1. Database Password ✅
- **Vous l'avez déjà** : `Terrains2024!Supabase#Secure`
- C'est le mot de passe pour se connecter à PostgreSQL

### 2. Connection String (à récupérer ailleurs)

Les informations de connexion complètes sont dans **Settings > Database** (section "Connection string") :

Vous devriez voir quelque chose comme :
```
Host: db.xxxxx.supabase.co
Database: postgres
Port: 5432 (direct) ou 6543 (pooler)
User: postgres
Password: [votre mot de passe]
```

---

## 🔧 Configuration pour pgAdmin

### SSL Configuration

**Important** : Pour pgAdmin, vous devez activer SSL.

1. Dans **SSL Configuration**, vérifier que :
   - ✅ **"Enforce SSL on incoming connections"** est activé (recommandé)
   - OU au minimum, vous pouvez vous connecter avec SSL mode "Require" dans pgAdmin

2. **SSL Certificate** :
   - Cliquer sur **"Download"** ou **"Show"** pour voir le certificat
   - Vous pouvez le télécharger si nécessaire (optionnel pour pgAdmin)

### Network Restrictions

**Pour le développement** :
- ✅ Laisser **"Your database can be accessed by all IP addresses"** pour l'instant
- Cela permet à pgAdmin (depuis votre machine) de se connecter

**Pour la production** (plus tard) :
- ⚠️ Ajouter des restrictions IP pour sécuriser
- Ajouter l'IP de Render.com (si vous déployez Laravel là-bas)

---

## 📝 Informations Complètes pour pgAdmin

Pour connecter pgAdmin, vous avez besoin de :

1. **Aller dans Settings > Database** (même section, mais cherchez "Connection string" ou "Connection info")

2. **Noter ces informations** :
   ```
   Host: db.xxxxx.supabase.co
   Port: 6543 (pour pooler) OU 5432 (direct)
   Database: postgres
   Username: postgres
   Password: Terrains2024!Supabase#Secure
   ```

3. **SSL Certificate** :
   - Si disponible, télécharger le certificat
   - OU utiliser SSL mode "Require" dans pgAdmin (fonctionne généralement sans certificat)

---

## 🔗 Où Trouver l'URL de Connexion Complète ?

### Option 1 : Connection String (Recommandé)

Dans **Settings > Database**, cherchez une section **"Connection string"** ou **"Connection info"**.

Vous devriez voir :
- **URI** : `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
- **JDBC** : `jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres?user=postgres&password=[PASSWORD]`

### Option 2 : Connection Pooling

Pour pgAdmin, utilisez le **Connection Pooler** :
- **Host** : `db.xxxxx.supabase.co`
- **Port** : `6543` (pooler port)
- **Database** : `postgres`
- **User** : `postgres`
- **Password** : `Terrains2024!Supabase#Secure`

---

## ✅ Configuration pgAdmin - Récapitulatif

### Onglet General
- **Name** : `Supabase - Terrains Synthetiques`

### Onglet Connection
- **Host** : `db.xxxxx.supabase.co` (trouvé dans Settings > Database)
- **Port** : `6543` (pooler) ou `5432` (direct)
- **Database** : `postgres`
- **Username** : `postgres`
- **Password** : `Terrains2024!Supabase#Secure`
- ✅ **Save password**

### Onglet SSL
- **SSL mode** : `Require`

---

## 🎯 Prochaines Étapes

1. ✅ **Noter le Host** : `db.xxxxx.supabase.co` (dans Settings > Database)
2. ✅ **Télécharger le SSL Certificate** (optionnel mais recommandé)
3. ✅ **Configurer pgAdmin** avec ces informations
4. ✅ **Tester la connexion**
5. ✅ **Exporter votre base locale**
6. ✅ **Importer dans Supabase**

---

## 💡 Astuce

Si vous ne trouvez pas le Host exact :
1. Aller dans **Settings > API**
2. L'URL du projet ressemble à : `https://xxxxx.supabase.co`
3. Le Host de la DB est : `db.xxxxx.supabase.co` (remplacer `xxxxx` par votre ID de projet)

---

## ⚠️ Important

- **Port 6543** : Pour le pooler (recommandé pour les connexions externes)
- **Port 5432** : Connexion directe (peut ne pas fonctionner selon la configuration)
- **SSL** : Toujours activer "Require" dans pgAdmin
- **Network Restrictions** : Laisser ouvert pour l'instant (développement)

---

**Une fois que vous avez le Host, vous pouvez configurer pgAdmin !** 🚀

